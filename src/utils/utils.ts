import * as fs from 'fs';
import * as crypto from 'crypto';
import { logger } from './logger';
import * as request from 'request-promise'
import * as http from 'http';
import * as zlib from 'zlib';
import * as Iconv from 'iconv-lite';

let downloadHTML = async function (host: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get({
            host: host,
            path: path,
            port: 80,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
                'Connection': 'keep-alive',
                'Host': host,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            },
            protocol: 'http:'
        }, function (res) {
            let html = '', output;
            if (res.headers['content-encoding'] == 'gzip') {
                let gzip = zlib.createGunzip();
                res.pipe(gzip);
                output = gzip;
            } else {
                output = res;
            }
            output.on('error', (err) => reject(err));
            output.on('data', (data) => {
                let buf = Iconv.decode(Buffer.from(data), 'utf-8')
                // let buf = data.toString('utf-8')
                // console.log(buf)
                html += buf;
            });
            output.on('end', () => {
                html = unescape(html.replace(/\\u/g, "%u"));  // 将unicode编码转中文
                resolve(html);
            });
        })
    })
}

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

async function retry(func: Function, ...args: any[]): Promise<any> {
    try {
        let result = await func.apply(func, args);
        return result;
    } catch (e) {
        logger.error('retry', func.name, e);
        return func.apply(func, args);
    }
}

// async function downloadHTML(href: string, encoding: string = 'binary') {
//     return request({
//         method: "GET",
//         uri: href,
//         encoding: encoding,
//         headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36' },
//         json: false,
//     })
// }



export { writeFile, retry, downloadHTML, hash }