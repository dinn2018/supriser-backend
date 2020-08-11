// import * as request from 'request-promise'
// import * as cheerio from 'cheerio';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as mkdirp from 'mkdirp';
// import { sequelize } from './sequelize-models';
// import { exec } from 'child_process';
// import { retry, writeFile, downloadHTML } from './utils/utils'
// import Cartoon from './sequelize-models/cartoon.model'
// import CartoonNum from './sequelize-models/cartoonnum.model'
// import CartoonSeries from './sequelize-models/cartoonseries.model'
// sequelize.sync();
// retry(syncAll);

// async function syncAll() {
//     await mkdirp(path.join(__dirname, '../static/images'));
//     await mkdirp(path.join(__dirname, '../static/cartoons'));
//     let root = 'https://manhua.fzdm.com/'
//     let data = await retry(downloadHTML, root, 'utf-8');
//     let $ = cheerio.load(data);
//     let cartoons: any[] = []
//     $('div.pure-g div#mhmain ul div.round li a').each((_, elem) => {
//         let href = `${root}${elem.attribs['href']}`;
//         let name = elem.attribs['title'];
//         let child = elem.firstChild;
//         if (child.type == 'tag' && child.name == 'img') {
//             let poster = elem.firstChild.attribs['src'];
//             cartoons.push({ href, name, poster });
//         }
//     });
//     let syncStart = false;
//     for (let cartoon of cartoons) {
//         let cartoonHref = cartoon.href;
//         await retry(downloadImage, cartoon.poster, path.join(__dirname, `../static/images/${cartoon.name}`));
//         let indexData = await retry(downloadHTML, cartoon.href, 'utf-8');
//         $ = cheerio.load(indexData);
//         let cartoonNums: any[] = [];
//         let c = await Cartoon.findOne({ where: { name: cartoon.name } });
//         if (!c) {
//             cartoon = await Cartoon.create({ name: cartoon.name, poster: `/static/images/${cartoon.name}` });
//         } else {
//             cartoon = c;
//         }
//         $('div.pure-g div#content li a').each((_, elem) => {
//             let href = `${cartoonHref}${elem.attribs['href']}`;
//             let name = elem.attribs['title'];
//             cartoonNums.push({ href, name });
//         })
//         for (let cartoonNum of cartoonNums) {
//             if (syncStart || cartoonNum.name.indexOf('961') != -1) {
//                 syncStart = true;
//             } else {
//                 continue;
//             }
//             let href = cartoonNum.href;
//             let cNum = await CartoonNum.findOne({ where: { name: cartoonNum.name } });
//             if (!cNum) {
//                 cartoonNum = await CartoonNum.create({ name: cartoonNum.name, cartoonoID: cartoon.id })
//             } else {
//                 cartoonNum = cNum;
//             }
//             await retry(downloadPages, href, href, cartoon.name, cartoonNum);
//         }
//     }
// }

// async function downloadPages(href: string, originRef: string, cartoonName: string, cartoonNum: CartoonNum) {
//     let data = await loadHTML(href);
//     let $ = cheerio.load(data);
//     let page: string;
//     $('a.button-success').each((_, elem) => {
//         page = elem.firstChild.data;
//         page = page.slice(1, page.length - 1)
//         console.log('page: ', page)
//     })
//     let imgPath = path.join(__dirname, `../static/cartoons/${cartoonName}/${cartoonNum.name}`);
//     let imgSrc = path.join(imgPath, page);
//     let firstChild: CheerioElement;
//     $('div#mhimg0').each((_, elem) => {
//         firstChild = elem.firstChild;
//     })
//     let url = `/static/cartoons/${cartoonName}/${cartoonNum.name}/${page}`
//     let cSeries = await CartoonSeries.findOne({ where: { url: url } })
//     if (!cSeries) {
//         await CartoonSeries.create({ cartoonNumID: cartoonNum.id, num: page, url });
//         if (firstChild.name == 'a') {
//             let nextHref = `${originRef}${firstChild.attribs['href']}`;
//             let img = firstChild.firstChild;
//             let src = img.attribs['src'];
//             await mkdirp(imgPath)
//             await retry(downloadImage, src, imgSrc);
//             await retry(downloadPages, nextHref, originRef, cartoonName, cartoonNum);
//         } else if (firstChild.name == 'img') {
//             let src = firstChild.attribs['src'];
//             await mkdirp(imgPath)
//             await retry(downloadImage, src, imgSrc);
//             return;
//         }
//     } else {
//         if (firstChild.name == 'a') {
//             let nextHref = `${originRef}${firstChild.attribs['href']}`;
//             let img = firstChild.firstChild;
//             let src = img.attribs['src'];
//             await mkdirp(imgPath)
//             await retry(downloadImage, src, imgSrc);
//             await retry(downloadPages, nextHref, originRef, cartoonName, cartoonNum);
//         } else if (firstChild.name == 'img') {
//             let src = firstChild.attribs['src'];
//             await mkdirp(imgPath)
//             await retry(downloadImage, src, imgSrc);
//             return;
//         }
//     }

// }

// async function downloadImage(url: string, path: string): Promise<string> {
//     if (!fs.existsSync(path)) {
//         request({
//             method: "GET",
//             uri: url,
//             json: false,
//         }).pipe(fs.createWriteStream(path));
//     }
//     return path;
// };

// function generatePhantomJS(href: string) {
//     return `var page = require('webpage').create();
// page.open('${href}', function (status) {
//     if (status == 'success') {
//         page.loadFinished(status);
//         phantom.exit();
//     } else {
//         console.log('error');
//         phantom.exit();
//     }
// });
// page.onLoadFinished = function (status) {
//     console.log(page.content);
//     phantom.exit();
// }`;
// }



// async function loadHTML(href: string): Promise<string> {
//     let jsPath = path.join(__dirname, 'phantom.js');
//     await writeFile(jsPath, generatePhantomJS(href));
//     let cmd = `phantomjs ${jsPath}`;
//     console.log('cmd ', cmd);
//     return await new Promise((resolve, reject) => {
//         exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//                 reject(error.message)
//             }
//             if (stderr) {
//                 reject(stderr);
//             }
//             resolve(stdout);
//         });
//     })
// }