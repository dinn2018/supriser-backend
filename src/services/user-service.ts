import { HttpError, ErrorCode, HttpStatusCode } from "../utils/httperror";
import { hash } from "../utils/utils"
import { redisClient } from "../utils/redis";
import User from "../sequelize-models/user.model";
export default class UserService {
    static async register(name: string, pass: string, secpass: string, token: string) {
        if (pass != secpass) throw new HttpError('password is inconsistent', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        let user = await User.findOne({ where: { name } });
        if (user) throw new HttpError('user is exsited', ErrorCode.Bad_Parameter, HttpStatusCode.Forbidden);
        user = await User.create({ name, passHash: hash(pass), updateTime: Date.now() })
        await redisClient.setAsync(token, JSON.stringify({ id: user.id, name: user.name, }));
    }

    static async login(name: string, pass: string, token: string) {
        let user = await User.findOne({ where: { name } });
        if (!user) throw new HttpError('user not found', ErrorCode.Bad_Parameter, HttpStatusCode.NotFound);
        if (user.passHash != hash(pass)) throw new HttpError('password is incorrect', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        await redisClient.setAsync(token, JSON.stringify({ id: user.id, name: user.name, }));
    }
}