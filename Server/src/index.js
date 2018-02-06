import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Session from 'koa-session';
import Router from 'koa-router';
import Serve from 'koa-static';
import koaPassport from 'koa-passport';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import Passport from './Passport.mjs';
import GraphQL from './GraphQL.mjs';

import Config from './../../config';

const app = new Koa();

app.keys = ['test'];

app.use(BodyParser());
app.use(Session({}, app));
app.use(koaPassport.initialize());
app.use(koaPassport.session());

const graphQL = new GraphQL();

const apiRouter = new Router();

apiRouter.all('/', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.status = 401;
  }
}, graphQL.http());

const authRouter = new Passport().router;
authRouter.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = ctx.isAuthenticated();
});

apiRouter.use('/auth', authRouter.routes(), authRouter.allowedMethods());

apiRouter.get('/logout', async (ctx) => {
  await ctx.logout();
  ctx.redirect('/');
});

const router = new Router();

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

app.use(router.routes());

app.use(historyApiFallback());
app.use(Serve(`${__dirname}/../../Client/dist`));

app.listen(process.env.POST || 3000, () => console.log(`listen ${Config.baseURL}`));
