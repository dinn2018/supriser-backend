import * as Router from 'koa-router';
import AnimeService from '../services/anime-service'
import Validator from '../utils/validator'

const router = new Router();

router.get("/api/animes/recommends", async (ctx) => {
    let data = await AnimeService.recommendAnimes();
    ctx.body = {
        data
    };
});

router.get("/api/animes/suggestions/:keyword", async (ctx) => {
    let keyword = ctx.params.keyword;
    Validator.validateParameter(keyword, 'keyword')
    let data = await AnimeService.suggestions(keyword)
    ctx.body = {
        data,
    };
})

router.get("/api/animes/search/:keyword", async (ctx) => {
    let keyword = ctx.params.keyword;
    Validator.validateParameter(keyword, 'keyword')
    let pageNum = ctx.request.query.pageNum
    Validator.validateParameter(pageNum, 'pageNum')
    let pageSize = ctx.request.query.pageSize;
    Validator.validateParameter(pageSize, 'pageSize')
    let data = await AnimeService.searchKeyword(keyword, parseInt(pageNum), parseInt(pageSize))
    ctx.body = {
        data,
    };
})

router.get("/api/animes/hotness", async (ctx) => {
    let data = await AnimeService.hotness()
    ctx.body = {
        data,
    };
})

router.post("/api/animes/:animeID/hotness/increment", async (ctx) => {
    let animeID = ctx.params.animeID;
    Validator.validateParameter(animeID, 'animeID')
    await AnimeService.incHotness(animeID)
    ctx.body = {};
})

router.get("/api/animes/weekday/:weekday", async (ctx) => {
    let weekday = ctx.params.weekday;
    Validator.validateParameter(weekday, 'weekday')
    let pageNum = ctx.request.query.pageNum
    Validator.validateParameter(pageNum, 'pageNum')
    let pageSize = ctx.request.query.pageSize;
    Validator.validateParameter(pageSize, 'pageSize')
    let animes = await AnimeService.weekdayAnimes(weekday, parseInt(pageNum), parseInt(pageSize))
    ctx.body = {
        data: animes,
    };
})


router.get("/api/animes/:animeID/series", async (ctx) => {
    let animeID = ctx.params.animeID;
    Validator.validateParameter(animeID, 'animeID')
    let order = ctx.request.query.order
    let data = await AnimeService.totalSeries(parseInt(animeID), order == 0)
    ctx.body = {
        data
    };
})

router.post("/api/animes", async (ctx) => {
    let pageSize = ctx.request.query.pageSize;
    Validator.validateParameter(pageSize, 'pageSize')
    let pageNum = ctx.request.query.pageNum
    Validator.validateParameter(pageNum, 'pageNum')
    let keyword = ctx.request.query.keyword;
    let postYears = ctx.request.body.postYears;
    let regions = ctx.request.body.regions;
    let data = await AnimeService.all(parseInt(pageSize), parseInt(pageNum), keyword, postYears, regions);
    ctx.body = {
        data
    };
});

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

router.get("/animes/:animeID/detail", async (ctx) => {
    let animeID = ctx.params.animeID;
    Validator.validateParameter(animeID, 'animeID')
    let order = ctx.request.query.order
    let anime = await AnimeService.get(parseInt(animeID));
    let episodes = await AnimeService.episodes(parseInt(animeID), order == 0)
    ctx.body = {
        data: {
            anime,
            episodes,
        }
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

export = router;