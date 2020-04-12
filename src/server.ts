import { sequelize } from './sequelize-models';
import * as Koa from 'koa';
import * as bodyParser from "koa-bodyparser";
import * as cors from 'koa-cors'
import * as serve from 'koa-static';
import * as mount from 'koa-mount';
import * as path from 'path';
import { registerRouter } from './router';
import { logger } from './utils/logger'
import { httpErrorMiddleware, userMiddleware } from './utils/middleware';
const convert = require('koa-convert');

sequelize.sync();
const app = new Koa();
app.proxy = process.env.REVERSE_PROXY === 'yes' ? true : false
if (!process.env.NODE_ENV || process.env.NODE_ENV == "dev") {
    app.use(serve(path.join(__dirname, '../static/images')));
    app.use(mount('/static/images', app));
}

app.use(convert(bodyParser()))
    .use(convert(cors({
        origin: process.env.SUPRISER_CORS || "*"
    })))
    .use(userMiddleware)
    .use(httpErrorMiddleware)
    .use(registerRouter());


const port = process.env.SUPRISER_PORT || 3000
app.listen(port);

logger.info("Server running on port: ", port)