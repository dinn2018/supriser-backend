import { HttpError, ErrorCode, HttpStatusCode } from '../utils/httperror';
import Anime from '../sequelize-models/anime.model'
import AnimeSeries from '../sequelize-models/animeseries.model';
import { Op, Sequelize } from "sequelize";
export default class AnimeService {
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
        return Anime.findOne({ where: { id } });
    }

    static async seriesList(pageSize: number, pageNum: number, animeID: number, order: boolean) {
        if (!pageSize || pageNum < 0 || pageSize < 0) {
            throw new HttpError('invalid params', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        let series = await AnimeSeries.findAll({
            limit: pageSize,
            offset: pageNum * pageSize,
            where: { animeID },
            order: [['num', `${order ? 'asc' : 'desc'}`]],
        });
        let count = await AnimeSeries.count({ where: { animeID } });
        return { data: series, count };

    }

    static async series(seriesID: number): Promise<AnimeSeries> {
        return AnimeSeries.findOne({ where: { id: seriesID } });
    }

    static async animeCategories() {
        let postYears = await Anime.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('postYear')), 'postYear'],
            ],
            limit: 8,
            order: [['postYear', 'desc']],
        });
        let regions = await Anime.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('region')), 'region'],

            ],
            limit: 6,
            order: [['region', 'desc']],
        })
        return { postYears: postYears.map((v) => v.postYear), regions: regions.map((v) => v.region) };
    }
}