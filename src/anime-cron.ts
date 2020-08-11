import * as later from 'later'
import * as mkdirp from 'mkdirp';
import * as path from 'path';

import { logger } from './utils/logger'
import { sequelize } from './sequelize-models';
import { rssDataListFromURL, refactorParams, getProtocal, downloadImage } from './utils/utils'
import Anime from './sequelize-models/anime.model'
import Episode from './sequelize-models/episode.model'

sequelize.sync();
sync2DaysAnimes();
let sched = later.parse.text('every 20 minutes');
later.setInterval(sync2DaysAnimes, sched);

async function sync2DaysAnimes() {
    await mkdirp(path.join(__dirname, '../static/images'));
    await mkdirp(path.join(__dirname, '../static/cartoons'));
    let videoTypes = [4, 16];
    let hours = 36;
    let host = 'caiji.kuyun98.com/inc/s_ldg_kkm3u8.php';
    logger.info('sync start');
    try {
        for (let type of videoTypes) {
            let href = `http://${host}?ac=videolist&t=${type}&pg=0&h=${hours}&ids=&wd=`;
            let data = await rssDataListFromURL(href);
            let pageCount = data['pagecount'];
            for (let pg = 0; pg < pageCount; pg++) {
                let url = `http://${host}?ac=videolist&t=${type}&pg=${pg}&h=${hours}&ids=&wd=`;
                let data = await rssDataListFromURL(url);
                let videos = data['video'];
                if (!(videos instanceof Array)) {
                    videos = [videos];
                }
                console.log('videos', Array.from(videos));
                for (let video of videos) {
                    let anime = new Anime();
                    anime.updateTime = Date.parse(video['last']);
                    anime.name = video['name'];
                    anime.poster = video['pic'];
                    anime.lang = refactorParams(video['lang']);
                    anime.region = refactorParams(video['area']);
                    anime.postYear = video['year'];
                    anime.status = video['state'];
                    anime.actor = refactorParams(video['actor']);
                    anime.director = refactorParams(video['director']);
                    anime.description = refactorParams(video['des']);
                    logger.info(`cron to: ${type} ${pg}/${pageCount}`, anime.toJSON());
                    let myAnime = await Anime.findOne({ where: { name: anime.name } })
                    if (myAnime) {
                        anime.id = myAnime.id;
                        await Anime.update({ updateTime: anime.updateTime, }, { where: { id: anime.id } })
                    } else {
                        anime = await Anime.create(anime.toJSON());
                    }
                    let dd = video['dl']['dd'];
                    let flag = dd['flag'];
                    let m3u8s = dd['$t'].split(`$${flag}`);
                    let playUrls: any = {};
                    for (let src of m3u8s) {
                        if (src) {
                            let protocal = getProtocal(src);
                            let splits = src.split(protocal);
                            let hostPath = splits[1];
                            let url = `${protocal}${hostPath}`;
                            let numPath = splits[0];
                            let num = numPath.replace(/[^(0-9|.)]/ig, "")
                            playUrls[num] = url;
                        }
                    }
                    let nums = Object.keys(playUrls);
                    for (let num of nums) {
                        let e = await Episode.findOne({ where: { animeID: anime.id, num: num } });
                        let episode = new Episode()
                        episode.url = playUrls[num];
                        episode.animeID = anime.id;
                        episode.num = num;
                        if (!e) {
                            episode.updateTime = anime.updateTime;
                            await Episode.create(episode.toJSON());
                        } else {
                            episode.updateTime = e.updateTime;
                            episode.id = e.id;
                            await Episode.update(episode.toJSON(), { where: { id: e.id } })
                        }
                    }
                }
            }
        }
    } catch (e) {
        logger.error('sync failed:', e);
        await sync2DaysAnimes()
    }

}



