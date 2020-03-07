
import * as Koa from 'koa';
import { HttpError, HttpStatusCode } from './httperror';
import { logger } from './logger'

let httpErrorMiddleware = async (ctx: Koa.ParameterizedContext<any, {}>, next: () => Promise<any>) => {
    try {
        await next()
    } catch (err) {
        if (err instanceof HttpError) {
            ctx.status = err.statusCode
            ctx.body = {
                code: err.code,
                message: err.message
            }
        } else {
            ctx.status = HttpStatusCode.InternalError
            logger.error("unexpected error: ", err)
        }
    }
}

export {
    httpErrorMiddleware
}