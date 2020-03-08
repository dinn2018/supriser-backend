import * as Router from 'koa-router';
import AnimeService from './anime-service'
import Validator from '../utils/validator'

var router = new Router();

router.get("/animes/categories", async (ctx) => {
    let data = await AnimeService.animeCategories();
    ctx.body = {
        data
    };
});

router.get("/animes/:id", async (ctx) => {
    let id = ctx.params.id;
    Validator.validateParameter(id, 'id')
    let anime = await AnimeService.get(parseInt(id));
    ctx.body = {
        data: anime,
    };
});

router.post("/animes", async (ctx) => {
    let pageSize = ctx.request.query.pageSize;
    Validator.validateParameter(pageSize, 'pageSize')
    let pageNum = ctx.request.query.pageNum
    Validator.validateParameter(pageNum, 'pageNum')
    let keyword = ctx.request.query.keyword;
    let postYears = ctx.request.body.postYears;
    let regions = ctx.request.body.regions;
    let data = await AnimeService.list(parseInt(pageSize), parseInt(pageNum), keyword, postYears, regions);
    ctx.body = {
        data
    };
});


router.get("/animes/:animeID/series", async (ctx) => {
    let animeID = ctx.params.animeID;
    Validator.validateParameter(animeID, 'animeID')
    let pageSize = ctx.request.query.pageSize;
    Validator.validateParameter(pageSize, 'pageSize')
    let pageNum = ctx.request.query.pageNum
    Validator.validateParameter(pageNum, 'pageNum')
    let order = ctx.request.query.order
    let data = await AnimeService.seriesList(parseInt(pageSize), parseInt(pageNum), parseInt(animeID), order == 0)
    ctx.body = {
        data
    };
})


router.get("/animes/series/:seriesID", async (ctx) => {
    let seriesID = ctx.params.seriesID;
    Validator.validateParameter(seriesID, 'seriesID')
    let series = await AnimeService.series(seriesID)
    ctx.body = {
        data: series,
    };
})


export default router;