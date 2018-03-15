import fs from 'fs-extra';
import nodePath from 'path';
import opn from 'opn';
import os from 'os';
import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Session from 'koa-session';
import Router from 'koa-router';
import Serve from 'koa-static';
import send from 'koa-send';
import koaPassport from 'koa-passport';
import multer from 'koa-multer';
import koaRange from 'koa-range';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import Passport from './Passport';
import GraphQL from './GraphQL';
import Config from './../../config';
import ServerConfig from '../config';
import DBManager from './DBManager';
import Thumbnail from './Thumbnail';
import Util from './Util';

const app = new Koa();

app.keys = ['test'];

app.use(BodyParser());
app.use(Session({}, app));
app.use(koaPassport.initialize());
app.use(koaPassport.session());
app.use(koaRange);

const db = new DBManager();

const uploadStorage = multer.diskStorage({
  async destination(request, file, callback) {
    const user = await db.getUser(request.user.userId);
    const path = `${Util.dirPath(user, 'NORMAL')}/${request.body.path || ''}`;
    await fs.ensureDir(path);
    callback(null, path);
  },
  async filename(request, file, callback) {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage: uploadStorage });

const graphQL = new GraphQL(db);
const passport = new Passport(db);

const apiRouter = new Router();

// noinspection JSAccessibilityCheck
apiRouter.all('/', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.throw(401);
  }
}, graphQL.http());

const authRouter = passport.router;
authRouter.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    auth: ctx.isAuthenticated(),
  };
  if (ctx.isAuthenticated()) ctx.body.userId = ctx.state.user.userId;
});

apiRouter.use('/auth', authRouter.routes(), authRouter.allowedMethods());

apiRouter.get('/logout', async (ctx) => {
  await ctx.logout();
  ctx.redirect('/');
});

apiRouter.post('/upload', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.throw(401);
  }
}, upload.array('files'), async (ctx) => {
  const user = await db.getUser(ctx.state.user.userId);
  await Promise.all(ctx.req.files.map(file => Thumbnail.createThumbnail(user, `${ctx.req.body.path}/${file.filename}`).catch(() => undefined)));
  ctx.status = 200;
});

/*
query = {
  type: ENUM = THUMBNAIL, // [RAW,THUMBNAIL]
  folder: ENUM = NORMAL, // [NORMAL,TRASH]
  path: String!,
};
*/
apiRouter.get('/file/:path*', async (ctx) => {
  const body = ctx.query;
  body.type = body.type || 'THUMBNAIL';
  body.folder = body.folder || 'NORMAL';
  if (!body.path) {
    body.path = ctx.params.path;
  }
  const user = await db.getUser(ctx.state.user.userId);
  let root;
  let path;
  switch (body.type) {
    case 'RAW': {
      path = body.path;
      root = Util.dirPath(user, body.folder);
      break;
    }
    case 'THUMBNAIL': {
      path = Thumbnail.getFilePath(user, body.path, body.folder);
      const fileName = Thumbnail.getFileName(body.path, body.folder);
      root = nodePath.resolve(path.substring(0, path.length - fileName.length));
      path = fileName;
      break;
    }
    default:
      ctx.throw(400, 'Invalid Folder');
      return;
  }
  if (fs.statSync(`${root}/${path}`).isDirectory()) {
    ctx.throw(400, 'path is directory');
    return;
  }
  await send(ctx, path, { root });
});

const router = new Router();

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

app.use(router.routes(), router.allowedMethods());

app.use(historyApiFallback());
app.use(async (ctx, next) => {
  if (ctx.path === '/check') ctx.path = '/index.html';
  await next();
});
app.use(Serve(`${__dirname}/../../Client/dist`));

graphQL.db.authenticate()
  .then(async () => {
    app.listen(process.env.PORT || 3000, () => {
      if (ServerConfig.isOpenBrowser) {
        const osType = os.type().toString();
        if (osType.match('Windows') !== null) {
          opn(Config.baseURL, { app: ['chrome', '--incognito'] });
        } else if (osType.match('Darwin') !== null) {
          opn(Config.baseURL, { app: ['google chrome', '--incognito'] });
        } else {
          opn(Config.baseURL, { app: ['google-chrome', '--incognito'] });
        }
      }
    });
    console.log(`listen: ${Config.baseURL}`); // eslint-disable-line
  });
