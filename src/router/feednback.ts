import * as Router from 'koa-router';
import Validator from '../utils/validator'
import FeedbackService from '../services/feedback-service';

let router = new Router();

router.post('/api/feedbacks', async (ctx) => {
    let feedback = ctx.request.body.feedback;
    Validator.validateParameter(feedback, 'feedback');
    await FeedbackService.send(feedback);
    ctx.body = {}
})

router.get('/api/feedbacks', async (ctx) => {
    let pageNum = ctx.request.query.pageNum
    Validator.validateParameter(pageNum, 'pageNum')
    let pageSize = ctx.request.query.pageSize;
    Validator.validateParameter(pageSize, 'pageSize')
    let data = await FeedbackService.list(parseInt(pageNum), parseInt(pageSize));
    ctx.body = {
        data,
    }
})
export = router;