import fs from 'fs-extra';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';

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
      
      input UpdateUser {
        username: String
        password: String
      }
      
      input clearAuth {
        twitterId: Boolean
        facebookId: Boolean
        instagramId: Boolean
      }
    
      type Query {
        getUser: User
        getFiles(path: String = ""): [File!]!
      }
      
      type Mutation {
        setUser(data: UpdateUser): User
        clearUserAuth(data: clearAuth): User
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
      getFiles: async ({ path }, ctx) => {
        const user = await this.db.getUser(ctx.state.user.userId);
        const savePath = `../Storage/${user.dirName}/${path}`;
        const files = await fs.readdir(savePath).catch(() => undefined);
        if (files) {
          return files.map(value => ({
            name: value,
            type: fs.statSync(`${savePath}/${value}`).isDirectory() ? 'DIRECTORY' : 'FILE',
          }));
        }
        return [];
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
