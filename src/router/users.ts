import * as Router from 'koa-router';
import Validator from '../utils/validator'
import UserService from '../services/user-service';

const router = new Router();

router.post('/users/register', async (ctx) => {
    let name = ctx.request.body.name;
    Validator.validateParameter(name, 'name');
    let pass = ctx.request.body.pass
    Validator.validateParameter(pass, 'pass');
    let secpass = ctx.request.body.secpass
    Validator.validateParameter(secpass, 'secpass');
    let token = ctx.request.body.token;
    await UserService.register(name, pass, secpass, token);
})

router.post('/users/login', async (ctx) => {
    let name = ctx.request.body.name;
    Validator.validateParameter(name, 'name')
    let pass = ctx.request.body.pass;
    Validator.validateParameter(pass, 'pass')
    let token = ctx.request.body.token;
    await UserService.login(name, pass, token);
})

export = router;