import fs from 'fs-extra';
import nodePath from 'path';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';
import Config from '../../../config';
import DBManager from '../DBManager.mjs';

class GraphQL {
  constructor(dbManager) {
    this.db = dbManager;
    this.schema = buildSchema(fs.readFileSync('schema.graphql', 'utf8'));
  }

  // noinspection JSUnusedGlobalSymbols
  async getUser(args, ctx) {
    const user = await this.db.getUser(ctx.state.user.userId)
      .catch(() => /* ignored */ undefined);
    return GraphQL.password(user);
  }

  // noinspection JSUnusedGlobalSymbols
  async setUser(args, ctx) {
    const data = args.data;
    if (data.oldPassword) {
      const user = await this.db.getUser({
        userId: ctx.state.user.userId,
      });
      const oldHash = DBManager.passwordStretch(data.oldPassword, user.createdAt);
      if (user.hash === oldHash) {
        data.password = data.newPassword;
        delete data.oldPassword;
        delete data.newPassword;
      }
    }
    ['twitterId', 'facebookId', 'instagramId'].forEach((key) => {
      if (data[key] === true) data[key] = null;
      else delete data[key];
    });
    return GraphQL.password(await this.db.updateUser(ctx.state.user.userId, data));
  }

  // noinspection JSUnusedGlobalSymbols
  async getFiles({ path, fileType, folderType }, ctx) {
    const user = await this.db.getUser(ctx.state.user.userId);
    const savePath = `../${Config.storage}/${user.dirName}${folderType === 'TRASH' ? '_Trash' : ''}/${path}`;
    const files = await fs.readdir(savePath).catch(() => undefined);
    if (files) {
      const map = files.map((value) => {
        const stat = fs.statSync(`${savePath}/${value}`);
        return {
          name: value,
          type: stat.isDirectory() ? 'DIRECTORY' : 'FILE',
        };
      });
      return fileType === null ? map : map.filter(value => value.type === fileType);
    }
    return [];
  }

  // noinspection JSUnusedGlobalSymbols
  async operateFile({ data, fileType }, ctx) {
    try {
      const user = await this.db.getUser(ctx.state.user.userId);
      switch (data.op) {
        case 'MKDIR':
          await fs.ensureDir(`../${Config.storage}/${user.dirName}/${data.path}/${data.source}`);
          break;
        case 'RENAME':
          await fs.rename(
            `../${Config.storage}/${user.dirName}/${data.path}/${data.source}`,
            `../${Config.storage}/${user.dirName}/${data.path}/${data.target}`,
          );
          break;
        case 'REMOVE': {
          const basePath = `../${Config.storage}/${user.dirName}`;
          const ext = nodePath.extname(data.source);
          const name = data.source.substring(0, data.source.length - ext.length);
          let i;
          try {
            await fs.access(`${basePath}_Trash/${name}${ext.length === 0 ? '' : `.${ext}`}`);
            for (i = 2; i < 10; i += 1) {
              fs.accessSync(`${basePath}_Trash/${name}(${i})${ext.length === 0 ? '' : `.${ext}`}`);
            }
            return Promise.reject(new Error('Failed'));
          } catch (ignored) {
            /* File Not Found */
          }
          await fs.move(
            `${basePath}/${data.path}/${data.source}`,
            `${basePath}_Trash/${name}${i ? `(${i})` : ''}${ext.length === 0 ? '' : `.${ext}`}`,
          );
          break;
        }
        case 'DELETE':
          await fs.remove(`../${Config.storage}/${user.dirName}_Trash/${data.path}/${data.source}`);
          break;
        case 'MOVE':
          await fs.move(
            `../${Config.storage}/${user.dirName}/${data.path}/${data.source}`,
            `../${Config.storage}/${user.dirName}/${data.target}/${data.source}`,
          );
          break;
        default:
      }
      return this.root.getFiles({
        path: data.path,
        fileType,
      }, ctx);
    } catch (e) {
      return Promise.reject(e);
    }
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
