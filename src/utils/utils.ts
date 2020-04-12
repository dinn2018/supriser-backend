import * as fs from 'fs';
import * as request from 'request-promise';
import * as crypto from 'crypto';
import { logger } from './logger';

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
        json: false,
    })
}

export { writeFile, retry, downloadHTML, hash }