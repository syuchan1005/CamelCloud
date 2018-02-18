import fs from 'fs-extra';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';
import Config from '../../config';

class GraphQL {
  constructor(dbManager) {
    this.db = dbManager;
    this.schema = buildSchema(`
      type User {
        userId: Int
        username: String
        password: String
        dirName: String
        twitterId: String
        facebookId: String
        instagramId: String
        createdAt: String
        updatedAt: String
      }
      
      type File {
        name: String
        type: FileType
      }
      
      enum FileType {
        FILE
        DIRECTORY
      }
      
      enum FileOperations {
        MKDIR
        RENAME
        REMOVE
        MOVE
      }
      
      enum FileTypeFilter {
        FILE
        DIRECTORY
        ALL
      }
      
      input UpdateUser {
        username: String
        password: String
      }
      
      input clearAuth {
        twitterId: Boolean
        facebookId: Boolean
        instagramId: Boolean
      }
      
      input opFile {
        op: FileOperations!
        path: String!
        source: String!
        target: String
      }
    
      type Query {
        getUser: User
        getFiles(path: String = "", fileType: FileTypeFilter = ALL): [File!]!
      }
      
      type Mutation {
        setUser(data: UpdateUser): User
        clearUserAuth(data: clearAuth): User
        operateFile(data: opFile, fileType: FileTypeFilter = ALL): [File!]!
      }
    `);
    // noinspection JSUnusedGlobalSymbols
    this.root = {
      getUser: async (args, ctx) => {
        const user = await this.db.getUser(ctx.state.user.userId)
          .catch(() => /* ignored */ undefined);
        return GraphQL.password(user);
      },
      setUser: async (args, ctx) =>
        GraphQL.password(await this.db.updateUser(ctx.state.user.userId, args.data)),
      clearUserAuth: async (args, ctx) => {
        const data = args.data;
        Object.keys(data).forEach((key) => {
          if (data[key] === true) data[key] = null;
          else delete data[key];
        });
        return GraphQL.password(await this.db.updateUser(ctx.state.user.userId, data));
      },
      getFiles: async ({ path, fileType }, ctx) => {
        const user = await this.db.getUser(ctx.state.user.userId);
        const savePath = `${Config.storage}/${user.dirName}/${path}`;
        const files = await fs.readdir(savePath).catch(() => undefined);
        if (files) {
          const map = files.map(value => ({
            name: value,
            type: fs.statSync(`${savePath}/${value}`).isDirectory() ? 'DIRECTORY' : 'FILE',
          }));
          return fileType === 'ALL' ? map : map.filter(value => value.type === fileType);
        }
        return [];
      },
      operateFile: async ({ data, fileType }, ctx) => {
        try {
          const user = await this.db.getUser(ctx.state.user.userId);
          switch (data.op) {
            case 'MKDIR':
              await fs.ensureDir(`${Config.storage}/${user.dirName}/${data.path}/${data.source}`);
              break;
            case 'RENAME':
              await fs.rename(
                `${Config.storage}/${user.dirName}/${data.path}/${data.source}`,
                `${Config.storage}/${user.dirName}/${data.path}/${data.target}`,
              );
              break;
            case 'REMOVE':
              await fs.remove(`${Config.storage}/${user.dirName}/${data.path}/${data.source}`);
              break;
            case 'MOVE':
              await fs.move(
                `${Config.storage}/${user.dirName}/${data.path}/${data.source}`,
                `${Config.storage}/${user.dirName}/${data.target}/${data.source}`,
              );
              break;
            default:
          }
          return this.root.getFiles({
            path: data.path,
            fileType,
          }, ctx);
        } catch (e) {
          return [];
        }
      },
    };
  }

  http() {
    return graphqlHTTP({
      schema: this.schema,
      rootValue: this.root,
      graphiql: true,
    });
  }

  static password(user) {
    if (user) user.password = !!user.hash; // eslint-disable-line
    return user;
  }
}


export default GraphQL;
