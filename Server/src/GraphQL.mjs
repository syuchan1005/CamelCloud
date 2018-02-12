import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';

class GraphQL {
  constructor(dbManager) {
    this.db = dbManager;
    this.schema = buildSchema(`
      type Query {
        getUser(id: Int!): User
      }
      
      type Mutation {
        setUser(userData: UpdateUser!): User
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
      
      type UpdateUser {
        userId: Int!
        username: String
        password: String
      }
    `);
    this.root = {
      getUser: async ({ id }) => {
        const user = await this.db.getUser(id);
        user.password = Boolean(user.hash);
        delete user.hash;
        return user;
      },
      setUser: async ({ userData }) => {
        const data = userData;
        delete data.userId;

        const user = await this.db.updateUser(userData.userId, data);
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
