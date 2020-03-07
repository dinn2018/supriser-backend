import { configure } from 'log4js';
import * as path from 'path';
const basePath = path.resolve(__dirname, "../../logs");

let log4 = configure({
    appenders: {
        info: {
            type: "dateFile",
            filename: basePath + '/supriser-info',
            alwaysIncludePattern: true,
            pattern: "yyyy-MM-dd.log",
            daysToKeep: 10
        },
        error: {
            type: 'dateFile',
            filename: basePath + '/supriser-error',
            alwaysIncludePattern: true,
            pattern: "yyyy-MM-dd.log",
            daysToKeep: 10
        }
    },
    categories: {
        error: { appenders: ['error'], level: 'error' },
        info: { appenders: ["info"], level: "info" },
        default: { appenders: ['info', 'error',], level: 'trace' }
    },
    pm2: true,
});
const log1 = log4.getLogger('info')
const log2 = log4.getLogger('error')
class logger {
    static info(message: any, ...args: any[]) {
        if (!process.env.NODE_ENV || process.env.NODE_ENV == "dev") {
            console.log(message, args);
        }
        if (args.length > 0) {
            log1.info(message, args)
        } else {
            log1.info(message)
        }
    }

    static error(message: any, ...args: any[]) {
        if (!process.env.NODE_ENV || process.env.NODE_ENV == "dev") {
            console.error(message, args);
        }
        if (args.length > 0) {
            log2.error(message, args)
        } else {
            log2.error(message)
        }
    }

}

export {
    logger
}
