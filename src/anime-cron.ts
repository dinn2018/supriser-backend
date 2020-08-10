import * as request from 'request-promise'
import * as cheerio from 'cheerio';
import * as later from 'later'
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { logger } from './utils/logger'
import { sequelize } from './sequelize-models';
import { downloadHTML } from './utils/utils'
import Anime from './sequelize-models/anime.model'
import Episode from './sequelize-models/episode.model'
sequelize.sync();

let sched = later.parse.text('every 10 minutes');
sync2DaysAnimes();

later.setInterval(sync2DaysAnimes, sched);

async function sync2DaysAnimes() {
    await mkdirp(path.join(__dirname, '../static/images'));
    await mkdirp(path.join(__dirname, '../static/cartoons'));
    let categoryNums = ['4', '16'];
    //parse anime list
    let now = Date.now();
    let animeUpdateTime = now;
    let totalPages = 0;
    let host = 'www.kuyunzyw.tv'
    try {
        for (let categoryNum of categoryNums) {
            if (now - animeUpdateTime >= 2 * 24 * 3600 * 1000) break;
            let currentPage = 0;
            //parse anime list
            let html = await downloadAnimeListHTML(categoryNum, host, currentPage);
            let $ = cheerio.load(html);
            //parse total pages
            let pagesText = $('body table tbody tr td div.pages').text()
            let splits = pagesText.split('/');
            if (splits.length < 2) {
                logger.error('download html failed');
                return;
            }
            let page = splits[1];
            totalPages = parseInt(page.split('页')[0]);
            console.log('totalPages', totalPages);
            while (currentPage < totalPages) {
                if (currentPage != 0) {
                    let data = await downloadAnimeListHTML(categoryNum, host, currentPage);
                    $ = cheerio.load(data);
                }
                //parse anime list
                let hrefs: string[] = [];
                $('table tr.row td:nth-child(1) a').each(async (_, elem) => {
                    hrefs.push(elem.attribs['href']);
                });
                for (let href of hrefs) {
                    let data = await downloadHTML(host, href);
                    $ = cheerio.load(data);
                    let anime = new Anime();
                    let namec = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(1) td:nth-child(1) strong').text();
                    if (namec == '影片名称：') {
                        anime.name = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(1) td:nth-child(1) font').text()
                    }
                    let actorc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(3) td:nth-child(1) strong').text();
                    if (actorc == '影片演员：') {
                        anime.actor = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(3) td:nth-child(1) font').text()
                        if (anime.actor == '内详' || anime.actor == '不详') {
                            anime.actor = '';
                        }
                    }
                    let directorc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(4) td:nth-child(1) strong').text();
                    if (directorc == '影片导演：') {
                        anime.director = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(4) td:nth-child(1) font').text()
                        if (anime.director == '内详' || anime.director == '不详') {
                            anime.director = '';
                        }
                    }
                    let regionc = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(6) td:nth-child(1) strong').text();
                    if (regionc == '影片地区：') {
                        anime.region = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(6) td:nth-child(1) font').text()
                    }
                    let updateTimec = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(7) td:nth-child(1) strong').text();
                    if (updateTimec == '更新时间：') {
                        let updateTime = $('table tbody tr:nth-child(1) td:nth-child(2) table tbody tr:nth-child(7) td:nth-child(1) font').text()
                        anime.updateTime = Date.parse(updateTime)
                        animeUpdateTime = anime.updateTime;
                        if (now - animeUpdateTime >= 2 * 24 * 3600 * 1000) break;
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
                    logger.info(`download image ${currentPage} ${anime.name} ${anime.updateTime}`);
                    anime.poster = await downloadImage(anime.poster, anime.name)
                    logger.info('image downloaded');
                    //upsert anime
                    let myAnime = await Anime.findOne({ where: { name: anime.name } })
                    if (myAnime) {
                        anime.id = myAnime.id;
                        await Anime.update({ updateTime: anime.updateTime }, { where: { id: anime.id } })
                    } else {
                        anime = await Anime.create(anime.toJSON());
                    }
                    let webUrls: any = {};
                    $('body table tbody tr:nth-child(2) td:nth-child(1) table tbody tr td a').each((_, elem) => {
                        let src = elem.firstChild.data;
                        let protocal = getProtocal(src);
                        let splits = src.split(protocal);
                        let hostPath = splits[1];
                        let url = `${protocal}${hostPath}`;
                        let numPath = splits[0];
                        let num = numPath.replace(/[^0-9]/ig, "")
                        webUrls[num] = url;
                    });
                    let playUrls: any = {};
                    $('body table tbody tr:nth-child(3) td:nth-child(1) table tbody tr td a').each((_, elem) => {
                        let src = elem.firstChild.data;
                        if (src.endsWith('m3u8')) {
                            let protocal = getProtocal(src);
                            let splits = src.split(protocal);
                            let hostPath = splits[1];
                            let url = `${protocal}${hostPath}`;
                            let numPath = splits[0];
                            let num = numPath.replace(/[^0-9]/ig, "")
                            playUrls[num] = url;
                        }
                    });
                    let downloadUrls: any = {}
                    $('body table tbody tr:nth-child(4) td:nth-child(1) table tbody tr td a').each((_, elem) => {
                        let src = elem.firstChild.data;
                        let protocal = getProtocal(src);
                        let splits = src.split(protocal);
                        let hostPath = splits[1];
                        let url = `${protocal}${hostPath}`;
                        let numPath = splits[0];
                        let num = numPath.replace(/[^0-9]/ig, "")
                        downloadUrls[num] = url;
                    });
                    let nums = Object.keys(playUrls);
                    for (let num of nums) {
                        let e = await Episode.findOne({ where: { animeID: anime.id, num: num } });
                        let episode = new Episode()
                        episode.webUrl = webUrls[num];
                        episode.url = playUrls[num];
                        episode.downloadUrl = downloadUrls[num];
                        episode.animeID = anime.id;
                        episode.num = num;
                        if (!e) {
                            episode.updateTime = Date.now();
                            await Episode.create(episode.toJSON());
                        } else {
                            console.log(e.id);
                            episode.updateTime = e.updateTime;
                            episode.id = e.id;
                            await Episode.update(episode.toJSON(), { where: { id: e.id } })
                        }
                    }
                }
                currentPage++;
            }
        }
    } catch (e) {
        logger.error('sync failed:', e);
        await sync2DaysAnimes()
    }

}


async function downloadAnimeListHTML(categoryNum: string, host: string, page: number): Promise<string> {
    return downloadHTML(host, `/?m=vod-type-id-${categoryNum}${page ? `-pg-${page + 1}` : ''}.html`)
}

function getProtocal(src: string) {
    let protocal = ''
    if (src.includes('https')) {
        protocal = 'https';
    } else if (src.includes('http')) {
        protocal = 'http';
    }
    return protocal;
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
