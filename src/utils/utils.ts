import * as fs from 'fs';
import * as crypto from 'crypto';
import { logger } from './logger';
import * as request from 'request-promise'

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

async function downloadHTML(href: string, encoding: string = 'binary') {
    return request({
        method: "GET",
        uri: href,
        encoding: encoding,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36' },
        json: false,
    })
}

export { writeFile, retry, downloadHTML, hash }