import * as path from 'path';
import * as later from 'later'
import { Op } from "sequelize";
import { sequelize } from '../sequelize-models';
import { exec } from 'child_process';
import { writeFile } from '../utils/utils'
import Anime from '../sequelize-models/anime.model'
import AnimeSeries from '../sequelize-models/animeseries.model'
import { logger } from '../utils/logger';
sequelize.sync();

let daySched = later.parse.text('every 1 day');
later.setInterval(dayWork, daySched);

let weekSched = later.parse.text('every 1 week');
later.setInterval(weekWork, weekSched);

async function dayWork() {
  await genRecentVideoSiteMap();
  await genAnimeSeriesSiteMap();
  await genAnimeSeriesSiteMap();
  await nginxReload();
}

async function weekWork() {
  await genAnimeInfoSiteMap();
  await genBaseSitemap();
  await nginxReload();
}

async function nginxReload() {
  let cmd = `nginx -s reload`;
  logger.info('cmd ', cmd);
  return await new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error.message)
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  })
}

genSitemap();
async function genSitemap() {
  await genAnimeInfoSiteMap();
  await genVideosSiteMap();
  await genAnimeSeriesSiteMap();
  await genRecentVideoSiteMap();
  await genBaseSitemap();
  await nginxReload();
}
async function genAnimeSeriesSiteMap() {
  let updateDate = currentDate();
  let head = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  let tail = `</urlset>`
  let animes = await Anime.findAll({ where: { [Op.or]: [{ region: '日本' }, { region: '大陆' },] } });
  for (let anime of animes) {
    let seriesList = await AnimeSeries.findAll({ where: { animeID: anime.id } });
    for (let series of seriesList) {
      head += `  <url>
    <loc>http://exanime.tv/#/animes/${anime.id}/series/${series.id}</loc>
    <lastmod>${updateDate}</lastmod>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
  </url>
`
    }
  }
  head += tail;
  let filePath = path.join(__dirname, '../../../supriser/dist/sitemap.animeSeries.xml');
  await writeFile(filePath, head)
  filePath = path.join(__dirname, '../../../supriser/public/sitemap.animeSeries.xml');
  await writeFile(filePath, head)
}

async function genAnimeInfoSiteMap() {
  let updateDate = currentDate();
  let head = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`
  let tail = `</urlset>`
  let animes = await Anime.findAll({ where: { [Op.or]: [{ region: '日本' }, { region: '大陆' },] } });
  for (let anime of animes) {
    head += `  <url>
    <loc>http://exanime.tv/#/animes/${anime.id}</loc>
    <lastmod>${updateDate}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
`
  }
  head += tail;
  let filePath = path.join(__dirname, '../../../supriser/dist/sitemap.animeInfo.xml');
  await writeFile(filePath, head);
  filePath = path.join(__dirname, '../../../supriser/public/sitemap.animeInfo.xml');
  await writeFile(filePath, head);

}

async function genRecentVideoSiteMap() {
  let updateDate = currentDate();
  let head = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://exanime.tv</loc>
    <lastmod>${updateDate}</lastmod>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
`
  let tail = `</urlset>`
  let animes = await Anime.findAll({ where: { [Op.or]: [{ region: '日本' }, { region: '大陆' },] } });
  for (let anime of animes) {
    let maxSeries = await AnimeSeries.findOne({ where: { animeID: anime.id }, order: [['num', 'desc']] });
    anime.name = anime.name.replace(new RegExp(/\&/g), '&amp;');
    anime.poster = anime.poster.replace(new RegExp(/\&/g), '&amp;');
    if (maxSeries) {
      logger.info('maxSeries: ', anime.name, maxSeries.num)
      head += `  <url>
      <loc>http://exanime.tv/#/animes/${anime.id}/series/${maxSeries.id}</loc>
      <lastmod>${updateDate}</lastmod>
      <priority>0.9</priority>
      <changefreq>daily</changefreq>
    </url>
`;
    }
  }
  head += tail;
  let filePath = path.join(__dirname, '../../../supriser/dist/sitemap.home.xml');
  await writeFile(filePath, head);
  filePath = path.join(__dirname, '../../../supriser/public/sitemap.home.xml');
  await writeFile(filePath, head);
}

async function genVideosSiteMap() {
  let updateDate = currentDate();
  console.log('updateDate', updateDate);
  let head = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" >
`
  let tail = `</urlset>`
  let animes = await Anime.findAll({ where: { [Op.or]: [{ region: '日本' }, { region: '大陆' },] } });
  for (let anime of animes) {
    let seriesList = await AnimeSeries.findAll({ where: { animeID: anime.id } });
    anime.name = anime.name.replace(new RegExp(/\&/g), '&amp;');
    anime.poster = anime.poster.replace(new RegExp(/\&/g), '&amp;');
    for (let series of seriesList) {
      head += `  <url>
    <lastmod>${updateDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <loc>http://exanime.tv/#/animes/${anime.id}/series/${series.id}</loc>
    <video:video>
      <video:thumbnail_loc>http://exanime.tv${anime.poster}</video:thumbnail_loc>
      <video:title>Grilling steaks for summer</video:title>
      <video:description>${anime.name} 第${series.num}集</video:description>
      <video:player_loc>${series.url}</video:player_loc>
      <video:publication_date>${new Date(anime.updateTime).toISOString()}</video:publication_date>
      <video:family_friendly>no</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>
`
    }
  }
  head += tail;
  let filePath = path.join(__dirname, '../../../supriser/dist/sitemap.video.xml');
  await writeFile(filePath, head);
  filePath = path.join(__dirname, '../../../supriser/public/sitemap.video.xml');
  console.log(filePath);
  await writeFile(filePath, head);
}

async function genBaseSitemap() {
  let baseSitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>http://exanime.tv/sitemap.home.xml</loc>
  </sitemap>
  <sitemap>
    <loc>http://exanime.tv/sitemap.animeInfo.xml</loc>
  </sitemap>
  <sitemap>
    <loc>http://exanime.tv/sitemap.animeSeries.xml</loc>
  </sitemap>
  <sitemap>
    <loc>http://exanime.tv/sitemap.video.xml</loc>
  </sitemap>
</sitemapindex>`
  let baseMapPath = path.join(__dirname, '../../../supriser/dist/sitemap.xml');
  await writeFile(baseMapPath, baseSitemap);
  baseMapPath = path.join(__dirname, '../../../supriser/public/sitemap.xml');
  await writeFile(baseMapPath, baseSitemap);
}

function currentDate(): string {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let monthStr = month.toString().length == 1 ? `0${month}` : `${month}`
  let day = date.getDate();
  let dayStr = day.toString().length == 1 ? `0${day}` : `${day}`
  return `${year}-${monthStr}-${dayStr}`
}