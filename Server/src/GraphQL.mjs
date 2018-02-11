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
        id: Int
        name: String
      }
    `);
    this.root = {
      user({ id }) {
        return {
          id,
          name: `name-${id}`,
        };
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
