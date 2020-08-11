import * as Router from 'koa-router';
// import Validator from '../utils/validator'
// import UserService from '../services/user-service';

let router = new Router();

// router.post('/users/register', async (ctx) => {
//     console.log('register', ctx.request.body)
//     let name = ctx.request.body.name;
//     Validator.validateParameter(name, 'name');
//     let pass = ctx.request.body.pass
//     Validator.validateParameter(pass, 'pass');
//     let repass = ctx.request.body.repass
//     Validator.validateParameter(repass, 'repass');
//     let token = ctx.request.body.token;
//     let user = await UserService.register(name, pass, repass, token);
//     ctx.body = { user }
// })

// router.post('/users/login', async (ctx) => {
//     let name = ctx.request.body.name;
//     Validator.validateParameter(name, 'name')
//     let pass = ctx.request.body.pass;
//     Validator.validateParameter(pass, 'pass')
//     let token = ctx.request.body.token;
//     await UserService.login(name, pass, token);
//     ctx.body = {}
// })

// router.post('/users/logout', async (ctx) => {
//     let token = ctx.request.body.token;
//     Validator.validateParameter(token, 'token')
//     await UserService.logout(token);
//     ctx.body = {}
// })

export = router;