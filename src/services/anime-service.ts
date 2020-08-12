import { HttpError, ErrorCode, HttpStatusCode } from '../utils/httperror';
import Anime from '../sequelize-models/anime.model'
import Episode from '../sequelize-models/episode.model';
import { Op, Sequelize, cast, col, } from "sequelize";

export default class AnimeService {
    static async searchKeyword(keyword: string, pageNum: number, pageSize: number) {
        if (!pageSize || pageNum < 0 || pageSize < 0) {
            throw new HttpError('invalid params', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        let animes = await Anime.findAll(
            {
                where: {
                    name: { [Op.like]: `%${keyword}%` },
                    isForbidden: 0,
                },
                attributes: ['id', 'name', 'poster', 'status', 'score', 'updateTime'],
                limit: pageSize,
                offset: pageNum * pageSize,
                order: [['hotness', 'desc',]],
            }
        )
        // for (let anime of animes) {
        //     let series = await AnimeSeries.findAll({
        //         where: { animeId: anime.id },
        //         order: [['num', 'asc']],
        //     })
        //     anime.setDataValue("seriesList", series)
        // }
        // console.log(animes)
        return animes;
    }

    static async suggestions(keyword: string) {
        let whereOptions: any = {}
        if (keyword && keyword != "") {
            whereOptions = {
                name: { [Op.like]: `%${keyword}%` },
                isForbidden: 0,
            }
        }
        let animes = await Anime.findAll(
            {
                where: whereOptions,
                attributes: ['id', 'name', 'updateTime'],
                order: [['hotness', 'desc',]],
            }
        )
        return animes;
    }
    static async hotness() {
        let animes = await Anime.findAll(
            {
                limit: 10,
                offset: 0,
                attributes: ['id', 'name', 'updateTime'],
                where: {
                    isForbidden: 0,
                },
                order: [['hotness', 'desc',]],
            }
        )
        return animes;
    }

    static async incHotness(animeID: number) {
        let anime = await Anime.findOne(
            {
                where: {
                    id: animeID,
                },
                order: [['hotness', 'desc',]],
            }
        )
        if (anime != null) {
            anime.hotness++;
            await Anime.update({ hotness: anime.hotness }, { where: { id: animeID } });
        }
    }

    static async all(pageSize: number, pageNum: number, keyword: string, postYears: number[], regions: string[]) {
        if (!pageSize || pageNum < 0 || pageSize < 0) {
            throw new HttpError('invalid params', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        let whereOptions: any = {}
        if (postYears.length == 1) {
            whereOptions.postYear = postYears[0];
        } else if (postYears.length > 1) {
            whereOptions.postYear = {
                [Op.notIn]: postYears,
            }
        }
        if (regions.length == 1) {
            whereOptions.region = regions[0];
        } else if (regions.length > 1) {
            whereOptions.region = {
                [Op.notIn]: regions,
            }
        }
        if (keyword) {
            whereOptions.name = { [Op.like]: `%${keyword}%` }
        }
        let animes = await Anime.findAll(
            {
                limit: pageSize,
                offset: pageNum * pageSize,
                where: whereOptions,
                order: [['updateTime', 'desc',]],
            }
        )
        return animes;
    }

    static async list(pageSize: number, pageNum: number, keyword: string, postYears: number[], regions: string[]) {
        if (!pageSize || pageNum < 0 || pageSize < 0) {
            throw new HttpError('invalid params', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        let whereOptions: any = {}
        if (postYears.length == 1) {
            whereOptions.postYear = postYears[0];
        } else if (postYears.length > 1) {
            whereOptions.postYear = {
                [Op.notIn]: postYears,
            }
        }

        if (regions.length == 1) {
            whereOptions.region = regions[0];
        } else if (regions.length > 1) {
            whereOptions.region = {
                [Op.notIn]: regions,
            }
        }
        if (keyword && keyword != "") {
            whereOptions.name = { [Op.like]: `%${keyword}%` }
        }

        let animes = await Anime.findAll(
            {
                limit: pageSize,
                offset: pageNum * pageSize,
                where: whereOptions,
                order: [['updateTime', 'desc',]],
            }
        )
        let count = await Anime.count({ where: whereOptions, })
        return { data: animes, count };
    }

    static async get(id: number): Promise<Anime> {
        let anime = await Anime.findOne({ where: { id } });
        return anime;
    }

    // static async maxEpisode(id: number): Promise<Episode> {
    //     let maxEpisodeNum = await Episode.findOne({
    //         attributes: [
    //             [Sequelize.fn('max', Sequelize.col('num')), 'maxNum'],
    //         ],
    //         where: { animeId: id, },
    //     })
    //     let maxEpisode = await Episode.findOne({ where: { num: (maxEpisodeNum as any).dataValues['maxNum'], animeId: id, } });
    //     return maxEpisode;
    // }

    static async episodes(animeID: number, order: boolean) {
        let es = await Episode.sequelize.query({ query: 'SELECT *,(num * 1.0) AS `cast_num` FROM `Episode` AS `Episode` WHERE `Episode`.`animeID` = ? ORDER BY `cast_num` ASC;', values: [animeID] })
        if (es.length > 0) {
            let episodes = (es[0] as any).map((v: any) => {
                let a = v as any;
                let e = new Episode()
                e.num = a.num || '00';
                e.id = a.id;
                e.url = a.url;
                e.downloadUrl = a.downloadUrl;
                e.webUrl = a.webUrl;
                e.animeID = a.animeID;
                e.updateTime = a.updateTime;
                return e
            })
            // let episodes = await Episode.findAll({
            //     where: { animeID },
            //     attributes: [
            //         ['num*1.0', 'cast_num'],
            //     ],
            //     order: [['cast_num', `${order ? 'desc' : 'asc'}`]],
            // });
            return episodes;
        }
        return [];
    }

    static async totalSeries(animeID: number, order: boolean) {
        let series = await Episode.findAll({
            where: { animeID },
            order: [['num', `${order ? 'asc' : 'desc'}`]],
        });
        return { data: series };
    }

    static async series(seriesID: number): Promise<Episode> {
        return Episode.findOne({ where: { id: seriesID } });
    }

    static async animeCategories() {
        let postYears = await Anime.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('postYear')), 'postYear'],
            ],
            limit: 6,
            order: [['postYear', 'desc']],
        });
        // let regions = await Anime.findAll({
        //     attributes: [
        //         [Sequelize.fn('DISTINCT', Sequelize.col('region')), 'region'],
        //     ],
        //     limit: 6,
        //     order: [['region', 'asc']],
        // })
        return { postYears: postYears.map((v) => v.postYear) };
    }

    static async weekdayAnimes(weekday: number, pageNum: number, pageSize: number) {
        let animes = await Anime.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('WEEKDAY', Sequelize.fn('FROM_UNIXTIME', Sequelize.literal('updateTime/1000'), '%Y-%m-%d')), { [Op.in]: [weekday] }),
                    { updateTime: { [Op.gte]: Date.now() - 30 * 24 * 3600 * 1000 } },
                ]
            },
            limit: pageSize,
            attributes: ['id', 'name', 'poster', 'status', 'score', 'updateTime'],
            offset: pageNum * pageSize,
            order: [['updateTime', 'desc']],
        });
        return animes;
    }

    static async regionAnimes(region: "domestic" | "japan" | "eura") {
        let animes = await Anime.findAll({
            where: {
                region: region == "domestic" ? "大陆" : region == "japan" ? "日本" : region == "eura" ? "欧美" : "",
            },
            attributes: ['id', 'name', 'poster', 'status', 'score', 'updateTime'],
            limit: 10,
            order: [['updateTime', 'desc']],
        });
        return animes;
    }

    static async recommends() {
        let whereOptions = {}//{ isRecommended: 1 }
        let animes = await Anime.findAll(
            {
                limit: 5,
                offset: 0,
                where: whereOptions,
                attributes: ['id', 'name', 'poster', 'hdPoster', 'status', 'score', 'updateTime'],
                order: [['hotness', 'desc']],
            }
        )
        return animes;
    }

    static async recommendAnimes() {
        let recs = await this.recommends();
        let domestic = await this.regionAnimes('domestic');
        let japan = await this.regionAnimes('japan');
        let eura = await this.regionAnimes('eura');
        return { recs, domestic, japan, eura };
    }
}