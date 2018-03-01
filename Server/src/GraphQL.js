import fs from 'fs-extra';
import nodePath from 'path';
import dateformat from 'dateformat';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';
import Config from '../../config';
import DBManager from './DBManager';

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
      return !fileFilter ? map : map.filter(value => value.type === fileFilter);
    }
    return [];
  }

  // noinspection JSUnusedGlobalSymbols
  async operateFile({ data }, ctx) {
    try {
      const user = await this.db.getUser(ctx.state.user.userId);
      const basePath = `../${Config.storage}/${user.dirName}`;
      let folderType = null;
      switch (data.op) {
        case 'MKDIR':
          await fs.ensureDir(`${basePath}/${data.path}/${data.source}`);
          break;
        case 'RENAME':
          await fs.rename(
            `${basePath}/${data.path}/${data.source}`,
            `${basePath}/${data.path}/${data.target}`,
          );
          break;
        case 'REMOVE': {
          const ext = nodePath.extname(data.source);
          let name = data.source.substring(0, data.source.length - ext.length);
          let i;
          const suffix = ext.length === 0 ? '' : ext;
          try {
            await fs.access(`${basePath}_Trash/${name}${suffix}`);
            name += ` ${dateformat(Date.now(), 'isoTime')}`;
            await fs.access(`${basePath}_Trash/${name}${suffix}`);
            for (i = 2; i < 10; i += 1) {
              fs.accessSync(`${basePath}_Trash/${name}(${i})${suffix}`);
            }
            return Promise.reject(new Error('Failed'));
          } catch (err) {
            await fs.move(
              `${basePath}/${data.path}/${data.source}`,
              err.path,
            );
          }
          break;
        }
        case 'DELETE':
          await fs.remove(`${basePath}_Trash/${data.path}/${data.source}`);
          folderType = 'TRASH';
          break;
        case 'MOVE':
          await fs.move(
            `${basePath}${data.sourceFolder === 'TRASH' ? '_Trash' : ''}/${data.path}/${data.source}`,
            `${basePath}/${data.target}/${data.source}`,
          );
          folderType = data.sourceFolder;
          break;
        default:
      }
      return await this.files({
        path: data.path,
        folderType,
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
