import * as Router from 'koa-router';
import AnimeService from './anime-service'
import Validator from '../utils/validator'

var router = new Router();

router.get("/animes/count", async (ctx) => {
    let count = await AnimeService.count()
    ctx.body = {
        data: count,
    };
})

router.get("/animes/:id", async (ctx) => {
    let id = ctx.params.id;
    Validator.validateParameter(id, 'id')
    let anime = await AnimeService.get(parseInt(id));
    ctx.body = {
        data: anime,
    };
});

router.get("/animes", async (ctx) => {
    let page_size = ctx.request.query.page_size;
    Validator.validateParameter(page_size, 'page_size')
    let page_num = ctx.request.query.page_num
    Validator.validateParameter(page_num, 'page_num')
    let keyword = ctx.request.query.keyword;
    let animes = await AnimeService.list(parseInt(page_size), parseInt(page_num), keyword);
    ctx.body = {
        data: animes,
    };
});


router.get("/animes/:anime_id/series", async (ctx) => {
    let anime_id = ctx.params.anime_id;
    Validator.validateParameter(anime_id, 'anime_id')
    let order = ctx.request.query.order
    let series = await AnimeService.seriesList(anime_id, order)
    ctx.body = {
        data: series,
    };
})


router.get("/animes/series/:series_id", async (ctx) => {
    let series_id = ctx.params.series_id;
    Validator.validateParameter(series_id, 'series_id')
    let series = await AnimeService.series(series_id)
    ctx.body = {
        data: series,
    };
})

export default router;