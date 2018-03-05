import fs from 'fs-extra';
import nodePath from 'path';
import dateformat from 'dateformat';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';
import Config from '../../config';
import DBManager from './DBManager';
import Thumbnail from './Thumbnail';

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
    const basePath = `../${Config.storage}/${user.dirName}`;
    const savePath = `${basePath}${folderType === 'TRASH' ? '_Trash' : ''}/${path}`;
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
            fs.accessSync(Thumbnail.getFilePath(basePath, `${path}/${data.name}`, folderType));
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
      const basePath = `../${Config.storage}/${user.dirName}`;
      let folderType = null;
      switch (data.op) {
        case 'MKDIR':
          await fs.ensureDir(`${basePath}/${data.path}/${data.source}`);
          break;
        case 'RENAME': {
          const beforePath = `${basePath}/${data.path}/${data.source}`;
          if (fs.statSync(beforePath).isFile()) {
            await fs.move(
              Thumbnail.getFilePath(basePath, `${data.path}/${data.source}`),
              Thumbnail.getFilePath(basePath, `${data.path}/${data.target}`),
            );
          }
          await fs.rename(
            beforePath,
            `${basePath}/${data.path}/${data.target}`,
          );
          break;
        }
        case 'REMOVE': {
          const ext = nodePath.extname(data.source);
          let name = data.source.substring(0, data.source.length - ext.length);
          let i;
          const suffix = ext.length === 0 ? '' : ext;
          try {
            await fs.access(`${basePath}_Trash/${name}${suffix}`);
            name += ` ${dateformat(Date.now(), 'HH-MM-ss')}`;
            await fs.access(`${basePath}_Trash/${name}${suffix}`);
            for (i = 2; i < 10; i += 1) {
              fs.accessSync(`${basePath}_Trash/${name}(${i})${suffix}`);
            }
            return Promise.reject(new Error('Failed'));
          } catch (err) {
            const beforePath = `${basePath}/${data.path}/${data.source}`;
            if (fs.statSync(beforePath).isFile()) {
              await fs.move(
                Thumbnail.getFilePath(basePath, `${data.path}/${data.source}`),
                Thumbnail.getFilePath(basePath, `${name}${i ? `(${i})` : ''}${suffix}`, 'TRASH'),
              );
            }
            await fs.move(beforePath, err.path);
          }
          break;
        }
        case 'DELETE': {
          const deletePath = `${basePath}_Trash/${data.path}/${data.source}`;
          if (fs.statSync(deletePath).isFile()) {
            await fs.remove(Thumbnail.getFilePath(basePath, `${data.path}/${data.source}`, 'TRASH'));
          }
          await fs.remove(deletePath);
          folderType = 'TRASH';
          break;
        }
        case 'MOVE': {
          const beforePath = `${basePath}${data.sourceFolder === 'TRASH' ? '_Trash' : ''}/${data.path}/${data.source}`;
          if (fs.statSync(beforePath).isFile()) {
            await fs.move(
              Thumbnail.getFilePath(basePath, `${data.path}/${data.source}`, data.sourceFolder),
              Thumbnail.getFilePath(basePath, `${data.target}/${data.source}`),
            );
          }
          await fs.move(
            beforePath,
            `${basePath}/${data.target}/${data.source}`,
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
    const basePath = `../${Config.storage}/${user.dirName}`;
    const files = await fs.readdir(`${basePath}_Trash`);
    files.forEach((file) => {
      fs.removeSync(`${basePath}_Trash/${file}`);
      fs.removeSync(Thumbnail.getFilePath(basePath, file, 'TRASH'));
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
