import { HttpError, ErrorCode, HttpStatusCode } from "../utils/httperror";
import { hash } from "../utils/utils"
import { redisClient } from "../utils/redis";
import User from "../sequelize-models/user.model";
export default class UserService {
    static async register(name: string, pass: string, repass: string, token: string) {
        if (pass != repass) throw new HttpError('密码不一致', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        let user = await User.findOne({ where: { name } });
        if (user) throw new HttpError('用户名已存在, 请更改用户名以注册', ErrorCode.Bad_Parameter, HttpStatusCode.Forbidden);
        user = await User.create({ name, passHash: hash(pass), updateTime: Date.now() })
        await redisClient.setAsync(token, JSON.stringify({ id: user.id, name: user.name, }));
        return user
    }

    static async login(name: string, pass: string, token: string) {
        let user = await User.findOne({ where: { name } });
        if (!user) throw new HttpError('用户名或密码不正确', ErrorCode.Bad_Parameter, HttpStatusCode.NotFound);
        if (user.passHash != hash(pass)) throw new HttpError('用户名或密码不正确', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        await redisClient.setAsync(token, JSON.stringify({ id: user.id, name: user.name, }));

    }

    static async logout(token: string) {
        let userStr = await redisClient.getAsync(token)
        let user: User = JSON.parse(userStr)
        await User.destroy({ where: { id: user.id } });
        await redisClient.delAsync(token)
    }
}