import fs from 'fs-extra';
import nodePath from 'path';
import dateFormat from 'dateformat';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';
import Config from '../../config';
import DBManager from './DBManager';
import Thumbnail from './Thumbnail';
import Util from "./Util";

class GraphQL {
  constructor(dbManager) {
    this.db = dbManager;
    this.schema = buildSchema(fs.readFileSync('schema.graphql', 'utf8'));
  }

  // noinspection JSUnusedGlobalSymbols
  async user(args, ctx) {
    const user = await this.db.getUser(ctx.state.user.userId)
      .catch(() => /* ignored */ undefined);
    return GraphQL.password(user);
  }

  // noinspection JSUnusedGlobalSymbols
  async updateUser({ data }, ctx) {
    const input = data;
    if (input.oldPassword) {
      const user = await this.db.getUser({
        userId: ctx.state.user.userId,
      });
      const oldHash = DBManager.passwordStretch(input.oldPassword, user.createdAt);
      if (user.hash === oldHash) {
        input.password = input.newPassword;
        delete input.oldPassword;
        delete input.newPassword;
      }
    }
    ['twitterId', 'facebookId', 'instagramId'].forEach((key) => {
      if (input[key] === true) input[key] = null;
      else delete input[key];
    });
    return GraphQL.password(await this.db.updateUser(ctx.state.user.userId, input));
  }

  // noinspection JSUnusedGlobalSymbols
  async files({ path, fileFilter, folderType }, ctx) {
    const user = await this.db.getUser(ctx.state.user.userId);
    const savePath = `${Util.dirPath(user, folderType)}/${path}`;
    const files = await fs.readdir(savePath).catch(() => undefined);
    if (files) {
      const map = files.map((value) => {
        const stat = fs.statSync(`${savePath}/${value}`);
        const data = {
          name: value,
          type: stat.isDirectory() ? 'DIRECTORY' : 'FILE',
        };
        if (data.type === 'FILE') {
          try {
            fs.accessSync(Thumbnail.getFilePath(user, `${path}/${data.name}`, folderType));
            data.thumb = true;
          } catch (ignored) {
            data.thumb = false;
          }
        }
        return data;
      });
      return !fileFilter ? map : map.filter(value => value.type === fileFilter);
    }
    return [];
  }

  // noinspection JSUnusedGlobalSymbols
  async operateFile({ data, fileFilter }, ctx) {
    try {
      const user = await this.db.getUser(ctx.state.user.userId);
      let folderType = 'NORMAL';
      switch (data.op) {
        case 'MKDIR':
          await fs.ensureDir(`${Util.dirPath(user, 'NORMAL')}/${data.path}/${data.source}`);
          break;
        case 'RENAME': {
          const beforePath = `${Util.dirPath(user, 'NORMAL')}/${data.path}/${data.source}`;
          if (fs.statSync(beforePath).isFile()) {
            await fs.move(
              Thumbnail.getFilePath(user, `${data.path}/${data.source}`),
              Thumbnail.getFilePath(user, `${data.path}/${data.target}`),
            ).catch(() => undefined);
          }
          await fs.rename(
            beforePath,
            `${Util.dirPath(user, 'NORMAL')}/${data.path}/${data.target}`,
          );
          break;
        }
        case 'REMOVE': {
          const ext = nodePath.extname(data.source);
          let name = data.source.substring(0, data.source.length - ext.length);
          let i;
          const suffix = ext.length === 0 ? '' : ext;
          try {
            await fs.access(`${Util.dirPath(user, 'TRASH')}/${name}${suffix}`);
            name += ` ${dateFormat(Date.now(), 'HH-MM-ss')}`;
            await fs.access(`${Util.dirPath(user, 'TRASH')}/${name}${suffix}`);
            for (i = 2; i < 10; i += 1) {
              fs.accessSync(`${Util.dirPath(user, 'TRASH')}/${name}(${i})${suffix}`);
            }
            return Promise.reject(new Error('Failed'));
          } catch (err) {
            const beforePath = `${Util.dirPath(user, 'NORMAL')}/${data.path}/${data.source}`;
            if (fs.statSync(beforePath).isFile()) {
              await fs.move(
                Thumbnail.getFilePath(user, `${data.path}/${data.source}`),
                Thumbnail.getFilePath(user, `${name}${i ? `(${i})` : ''}${suffix}`, 'TRASH'),
              ).catch(() => undefined);
            }
            await fs.move(beforePath, err.path);
          }
          break;
        }
        case 'DELETE': {
          const deletePath = `${Util.dirPath(user, 'TRASH')}/${data.path}/${data.source}`;
          if (fs.statSync(deletePath).isFile()) {
            await fs.remove(Thumbnail.getFilePath(user, `${data.path}/${data.source}`, 'TRASH')).catch(() => undefined);
          }
          await fs.remove(deletePath);
          folderType = 'TRASH';
          break;
        }
        case 'MOVE': {
          const beforePath = `${Util.dirPath(user, data.sourceFolder)}/${data.path}/${data.source}`;
          if (fs.statSync(beforePath).isFile()) {
            await fs.move(
              Thumbnail.getFilePath(user, `${data.path}/${data.source}`, data.sourceFolder),
              Thumbnail.getFilePath(user, `${data.target}/${data.source}`, 'NORMAL'),
            ).catch(() => undefined);
          }
          await fs.move(
            beforePath,
            `${Util.dirPath(user, 'NORMAL')}/${data.target}/${data.source}`,
          );
          folderType = data.sourceFolder;
          break;
        }
        default:
      }
      return await this.files({
        path: data.path,
        folderType,
        fileFilter,
      }, ctx);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  async emptyTrash(args, ctx) {
    const user = await this.db.getUser(ctx.state.user.userId);
    const files = await fs.readdir(Util.dirPath(user, 'TRASH'));
    files.forEach((file) => {
      fs.removeSync(`${Util.dirPath(user, 'TRASH')}/${file}`);
      try {
        fs.removeSync(Thumbnail.getFilePath(user, file, 'TRASH'));
      } catch (ignored) { /* ignore */ }
    });
    return [];
  }

  http() {
    return graphqlHTTP({
      schema: this.schema,
      rootValue: this,
      graphiql: Config.graphiql,
    });
  }

  static password(user) {
    if (user) user.password = !!user.hash; // eslint-disable-line
    return user;
  }
}


export default GraphQL;
