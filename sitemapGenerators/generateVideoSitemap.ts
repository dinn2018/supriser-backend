import * as fs from 'fs';
import * as path from 'path';
import Anime from '../src/sequelize-models/anime.model'
import AnimeSeries from '../src/sequelize-models/animeseries.model'
import { sequelize } from '../src/sequelize-models';
import { Op } from "sequelize";
sequelize.sync();
genSiteMap();

async function genSiteMap() {
    let head = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video = "http://www.google.com/schemas/sitemap-video/1.1" >`
    let tail = ` </urlset>`
    let animes = await Anime.findAll({ where: { [Op.or]: [{ region: '日本' }, { region: '大陆' },] } });
    for (let anime of animes) {
        let maxSeries = await AnimeSeries.findOne({ where: { animeID: anime.id }, order: [['num', 'desc']] });
        anime.name = anime.name.replace(new RegExp(/\&/g), '&amp;');
        anime.poster = anime.poster.replace(new RegExp(/\&/g), '&amp;');
        if (maxSeries) {
            console.log('maxSeries: ', anime.name, maxSeries.num)
            head += `
  <url>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <loc>http://exanime.tv/#/animes/${anime.id}/series/${maxSeries.id}?pageNum=1&amp;orderUp=false</loc>
      <video:video>
        <video:thumbnail_loc>http://exanime.tv${anime.poster}</video:thumbnail_loc>
          <video:title>Grilling steaks for summer</video:title>
          <video:description>${anime.name} 第${maxSeries.num}集</video:description>
          <video:player_loc>${maxSeries.url}</video:player_loc>
          <video:publication_date>${new Date(anime.updateTime).toISOString()}</video:publication_date>
          <video:family_friendly>no</video:family_friendly>
          <video:restriction relationship="allow">TW HK CN</video:restriction>
          <video:live>no</video:live>
          </video:video>
  </url>`
        }

    }
    head += tail;
    fs.writeFileSync(path.join(__dirname, './sitemap.video.xml'), head);

}