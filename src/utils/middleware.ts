
import * as Koa from 'koa';
import { HttpError, HttpStatusCode } from './httperror';
import { logger } from './logger'
import * as crypto from 'crypto'
// import { redisClient } from './redis';

let httpErrorMiddleware = async (ctx: Koa.ParameterizedContext<any, {}>, next: () => Promise<any>) => {
    try {
        await next()
        logger.info(`
from: ${ctx.request.ip}
request: ${ctx.request.url}
`);
    } catch (err) {
        if (err instanceof HttpError) {
            logger.error("HttpError: ", err)
            ctx.status = err.statusCode
            ctx.body = {
                code: err.code,
                message: err.message
            }
        } else {
            ctx.status = HttpStatusCode.InternalError
            ctx.body = { message: "system error" }
            logger.error("unexpected error: ", err)
        }
    }
}

// let userMiddleware = async (ctx: Koa.ParameterizedContext<any, {}>, next: () => Promise<any>) => {
//     let token = ctx.request.query.token || ctx.request.body.token;
//     if (!token) {
//         token = crypto.randomBytes(16).toString('hex');
//         console.log('randomBytes', token);
//         ctx.request.body.token = token;
//         ctx.request.query.token = token;
//     }
//     await next()
//     let user = await redisClient.getAsync(token);
//     console.log('user', user)
//     if (user) {
//         user = JSON.parse(user);
//         console.log('parse user', user);
//         await redisClient.expireAsync(token, 3600 * 24 * 60 * 10);
//         ctx.body = Object.assign(ctx.body, { user: { token, name: user.name, id: user.id } });
//     }
// }

export {
    httpErrorMiddleware,
    // userMiddleware
}