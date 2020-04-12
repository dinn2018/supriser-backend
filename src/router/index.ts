import * as compose from 'koa-compose'
import * as glob from 'glob'
import { resolve } from 'path'

function registerRouter() {
    let routers: compose.Middleware<any>[] = [];
    glob.sync(resolve(__dirname, './', '**/*.js'))
        .filter(v => v.indexOf('index.js') == -1)
        .every(r => {
            let router = require(r);
            routers.push(router.routes())
            routers.push(router.allowedMethods())
        });
    return compose(routers)
}

export { registerRouter }