import * as fs from 'fs';
import * as path from 'path';
import Anime from '../src/sequelize-models/anime.model'
import AnimeSeries from '../src/sequelize-models/animeseries.model'
import { sequelize } from '../src/sequelize-models';
import { Op } from "sequelize";
sequelize.sync();
genSiteMap();

async function genSiteMap() {
  let updateDate = '2020-03-12';
  let head = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" >`
  let tail = `</urlset>`
  let animes = await Anime.findAll({ where: { [Op.or]: [{ region: '日本' }, { region: '大陆' },] } });
  for (let anime of animes) {
    let seriesList = await AnimeSeries.findAll({ where: { animeID: anime.id } });
    // anime.name = anime.name.replace(new RegExp(/\&/g), '&amp;');
    // anime.poster = anime.poster.replace(new RegExp(/\&/g), '&amp;');
    for (let series of seriesList) {
      head += `<url>
    <lastmod>${updateDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <loc>http://exanime.tv/#/animes/${anime.id}/series/${series.id}?pageNum=1&orderUp=false</loc>
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
  fs.writeFileSync(path.join(__dirname, './sitemap.video.xml'), head);

}