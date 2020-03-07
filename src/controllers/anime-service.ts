import { HttpError, ErrorCode, HttpStatusCode } from '../utils/httperror';
import Anime from '../sequelize-models/anime.model'
import AnimeSeries from '../sequelize-models/animeseries.model';
import { Op } from "sequelize";
export default class AnimeService {
    static async list(page_size: number, page_num: number, keyword: string): Promise<Array<Anime>> {
        if (!page_size || page_num < 0 || page_size < 0) {
            throw new HttpError('invalid parames', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        let whereOptions = {}
        if (keyword && keyword != "") {
            whereOptions = {
                name: { [Op.like]: `%${keyword}%` }
            }
        }
        return Anime.findAll(
            {
                offset: page_num * page_size,
                limit: page_size,
                where: whereOptions,
                order: [['updateTime', 'desc',]],
            }
        )
    }

    static async count(): Promise<number> {
        return Anime.count();
    }

    static async get(id: number): Promise<Anime> {
        return Anime.findOne({ where: { id } });
    }

    static async seriesList(animeID: number, order: number): Promise<Array<AnimeSeries>> {
        return AnimeSeries.findAll({ where: { animeID }, order: [['num', `${order ? 'asc' : 'desc'}`]] });
    }

    static async series(seriesID: number): Promise<AnimeSeries> {
        return AnimeSeries.findOne({ where: { id: seriesID } });
    }

}