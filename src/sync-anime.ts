import * as request from 'request-promise'
import * as cheerio from 'cheerio';
import * as Iconv from 'iconv-lite';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { logger } from './utils/logger'
import Anime from './sequelize-models/anime.model'
import AnimeSeries from './sequelize-models/animeseries.model'
import { sequelize } from './sequelize-models';
sequelize.sync();
syncAll();
async function syncAll() {
    try {
        let categoryNums = ['31', '39'];
        await mkdirp(path.join(__dirname, '../static/images'));
        for (let categoryNum of categoryNums) {
            let currentPage = 0;
            //parse anime list
            let totalPages = 0;
            let root = 'http://www.kuyunzy1.com'
            let data = await downloadAnimeListHTML(categoryNum, root, currentPage);
            let html = Iconv.decode(Buffer.from(data, 'binary'), 'gbk');
            let $ = cheerio.load(html);
            //parse total pages
            $('div.pages span').each((_, elem) => {
                let data = elem.firstChild.data;
                if (data) {
                    let pages = data.split('/');
                    totalPages = parseInt(pages[1].substring(0, pages[1].length - 1));
                }
            });

            while (currentPage < totalPages) {
                if (currentPage != 0) {
                    let nextPageData = await downloadAnimeListHTML(categoryNum, root, currentPage);
                    html = Iconv.decode(Buffer.from(nextPageData, 'binary'), 'gbk');
                    $ = cheerio.load(html);
                }
                //parse anime list
                let hrefs: string[] = [];
                $('table tr.row a').each(async (_, elem) => {
                    let href = root + elem.attribs['href'];
                    hrefs.push(href);
                });
                //parse anime info
                for (let href of hrefs) {
                    let data = await request({
                        encoding: "binary",
                        method: "GET",
                        uri: href,
                        json: false,
                    });
                    let $ = cheerio.load(Iconv.decode(Buffer.from(data, 'binary'), 'gbk'));
                    let anime: any = {};
                    let namec = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(1) td:nth-child(1) strong').text();
                    if (namec == '影片名称：') {
                        anime.name = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(1) td:nth-child(1) font').text()
                    }
                    let directorc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(4) td:nth-child(1) strong').text();
                    if (directorc == '影片导演：') {
                        anime.director = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(4) td:nth-child(1) font').text()
                    }
                    let regionc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(6) td:nth-child(1) strong').text();
                    if (regionc == '影片地区：') {
                        anime.region = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(6) td:nth-child(1) font').text()
                    }
                    let updateTimec = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(7) td:nth-child(1) strong').text();
                    if (updateTimec == '更新时间：') {
                        let updateTime = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(7) td:nth-child(1) font').text()
                        anime.updateTime = Date.parse(updateTime)
                    }
                    let statusc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(8) td:nth-child(1) strong').text();
                    if (statusc == '影片状态：') {
                        anime.status = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(8) td:nth-child(1) font').text()
                    }
                    let langc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(9) td:nth-child(1) strong').text();
                    if (langc == '影片语言：') {
                        anime.lang = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(9) td:nth-child(1) font').text()
                    }
                    let postYearc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(10) td:nth-child(1) strong').text();
                    if (postYearc == '上映日期：') {
                        let postYear = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(10) td:nth-child(1) font').text()
                        anime.postYear = parseInt(postYear);
                    }
                    anime.description = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(11) td:nth-child(1) font').text();
                    $('table tbody tr:nth-child(1) td:nth-child(1) div img').each((_, elem) => {
                        anime.poster = elem.attribs['src'];
                    });
                    logger.info(`download image ${anime.name}`);
                    anime.poster = await downloadImage(anime.poster, anime.name)
                    logger.info('image downloaded');
                    //upsert anime
                    let myAnime = await Anime.findOne({ where: { name: anime.name } })
                    if (myAnime) {
                        anime.id = myAnime.id;
                        await Anime.update(anime, { where: { name: anime.name } })
                    } else {
                        anime = await Anime.create(anime);
                    }
                    logger.info('anime inserted', anime.id, anime.name);
                    let animeSeries: any[] = [];
                    $('table tbody tr:nth-child(3) td:nth-child(1) table tbody tr td a').each((_, elem) => {
                        let src = elem.firstChild.data;
                        if (src.endsWith('m3u8')) {
                            let srcs = src.split('$');
                            let number = srcs[0].substring(1, srcs[0].length - 1);
                            let url = srcs[1];
                            animeSeries.push({
                                url,
                                num: parseInt(number),
                                animeID: anime.id,
                            });
                        }
                    });
                    for (let series of animeSeries) {
                        await AnimeSeries.upsert(series);
                    }
                }
                currentPage++;
            }
        }

    } catch (e) {
        logger.error('sync all failed', e);
        //resync
        await syncAll();
    }
}

async function downloadAnimeListHTML(categoryNum: string, root: string, page: number) {
    let url = root + `/list/?${categoryNum}${page ? `-${page + 1}` : ''}.html`;
    return await request({
        method: "GET",
        encoding: "binary",
        uri: url,
        json: false,
    })
}

async function downloadImage(url: string, imageName: string): Promise<string> {
    if (imageName.indexOf('/') != -1) {
        imageName = imageName.replace(new RegExp(/\//g), ' ');
    }
    let dir = path.join(__dirname, '../static/images', `/${imageName}`);
    if (!fs.existsSync(dir)) {
        request({
            method: "GET",
            uri: url,
            json: false,
        }).pipe(fs.createWriteStream(dir));
    }
    return `/static/images/${imageName}`;
};
