import * as fs from 'fs';
import * as request from 'request-promise'
import { logger } from './logger';
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
        await func.apply(func, args);
    }
}

async function downloadHTML(href: string) {
    return request({
        method: "GET",
        uri: href,
        json: false,
    })
}

export { writeFile, retry, downloadHTML }