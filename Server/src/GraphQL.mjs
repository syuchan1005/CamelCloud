import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';

class GraphQL {
  constructor(dbManager) {
    this.db = dbManager;
    this.schema = buildSchema(`
      type Query {
        user(id: Int): User
      }
      
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
    `);
    this.root = {
      user: async ({ id }) => {
        const user = await this.db.getUser(id);
        user.password = Boolean(user.hash);
        delete user.hash;
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
