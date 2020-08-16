import { HttpError, ErrorCode, HttpStatusCode } from '../utils/httperror';
import Feedback from '../sequelize-models/feedback.model'
import { Op, Sequelize } from "sequelize";

export default class FeedbackService {
    static async send(feedback: string) {
        if (!feedback) {
            throw new HttpError('反馈内容不可为空', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        await Feedback.create({ content: feedback, updateTime: Date.now() });
    }

    static async list(pageNum: number, pageSize: number) {
        if (!pageSize || pageNum < 0 || pageSize < 0) {
            throw new HttpError('invalid params', ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest);
        }
        return Feedback.findAll(
            {
                limit: pageSize,
                offset: pageNum * pageSize,
                order: [['updateTime', 'desc',]],
            }
        );
    }
}