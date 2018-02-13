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
        dirId: Int
        twitterId: String
        facebookId: String
        instagramId: String
        createdAt: String
        updatedAt: String
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
    
      type Mutation {
        setUser(data: UpdateUser): User
        clearUserAuth(data: clearAuth): User
      }
      
      type Query {
        getUser: User
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
