import * as fs from 'fs';
import * as crypto from 'crypto';
import { logger } from './logger';
import * as request from 'request-promise'
import * as Iconv from 'iconv-lite';
import * as XML2JSON from 'xml2json';

function hash(str: string) {
    return crypto.createHash('md5').update(str).digest().toString('hex');
}

async function writeFile(path: string, data: string) {
    await new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        })
    });
}

async function downloadXML(href: string, encoding: string = 'binary') {
    return request({
        method: "GET",
        uri: href,
        encoding: encoding,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36' },
        json: false,
    })
}

function refactorParams(param: any) {
    let str = param;
    if (param == '不详' || param == '内详' || typeof param == 'object') return str = '';
    return str.replace(new RegExp(/\&[0-9 a-z A-Z]*\;/g), '');
}

async function rssDataListFromURL(href: string) {
    let data = await downloadXML(href);
    let xml = Iconv.decode(data, 'utf-8');
    let json = JSON.parse(XML2JSON.toJson(xml));
    let rssData = json['rss'];
    return rssData['list'];
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


export { writeFile, refactorParams, getProtocal, rssDataListFromURL }