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
import historyApiFallback from 'koa2-connect-history-api-fallback';
import Passport from './Passport';
import GraphQL from './GraphQL';
import Config from './../../config';
import ServerConfig from '../config';
import DBManager from './DBManager';
import Thumbnail from './Thumbnail';

const app = new Koa();

app.keys = ['test'];

app.use(BodyParser());
app.use(Session({}, app));
app.use(koaPassport.initialize());
app.use(koaPassport.session());

const db = new DBManager();

const uploadStorage = multer.diskStorage({
  async destination(request, file, callback) {
    const user = await db.getUser(request.user.userId);
    const path = `../${Config.storage}/${user.dirName}/${request.body.path || ''}`;
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
  await Promise.all(ctx.req.files.map((file) => {
    const dist = file.destination.substr(0, file.destination.length - ctx.req.body.path.length);
    return Thumbnail.createThumbnail(dist, `${ctx.req.body.path}/${file.filename}`);
  }));
  ctx.status = 200;
});

/*
query = {
  type: ENUM = THUMBNAIL, // [RAW,THUMBNAIL]
  folder: ENUM = NORMAL, // [NORMAL,TRASH]
  path: String!,
};
*/
apiRouter.get('/file', async (ctx) => {
  try {
    const body = ctx.query;
    body.type = body.type || 'THUMBNAIL';
    body.folder = body.folder || 'NORMAL';
    if (!body.path) throw new Error('path Not Found');
    const user = await db.getUser(ctx.state.user.userId);
    const basePath = `../${Config.storage}/${user.dirName}`;
    let root;
    let path;
    switch (body.type) {
      case 'RAW': {
        path = body.path;
        root = `${basePath}${body.folder === 'TRASH' ? '_Trash' : ''}`;
        break;
      }
      case 'THUMBNAIL': {
        path = Thumbnail.getFilePath(basePath, body.path, body.folder);
        const fileName = Thumbnail.getFileName(body.path, body.folder);
        root = nodePath.resolve(path.substring(0, path.length - fileName.length));
        path = fileName;
        break;
      }
      default: throw new Error('Invalid Folder');
    }
    if (fs.statSync(`${root}/${path}`).isDirectory()) throw new Error('path is directory');
    await send(ctx, path, { root });
  } catch (err) {
    ctx.throw(400, err);
  }
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
    app.listen(process.env.POST || 3000, () => {
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
