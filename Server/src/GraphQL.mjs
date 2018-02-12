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
        twitterId: Int
        facebookId: Int
        instagramId: Int
        createdAt: String
        updatedAt: String
      }
      
      input UpdateUser {
        username: String
        password: String
      }
    
      type Mutation {
        setUser(data: UpdateUser): User
      }
      
      type Query {
        getUser: User
      }
    `);
    this.root = {
      getUser: async (args, ctx) => {
        const user = await this.db.getUser(ctx.state.user.userId);
        if (user === undefined) return undefined;
        user.password = Boolean(user.hash);
        delete user.hash;
        return user;
      },
      setUser: async (args, ctx) => {
        const user = await this.db.updateUser(ctx.state.user.userId, args.data);
        return user;
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
}


export default GraphQL;
