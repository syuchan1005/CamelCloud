import { buildSchema } from 'graphql';
import graphqlHTTP from 'koa-graphql';

class GraphQL {
  constructor() {
    this.schema = buildSchema(`
      type Query {
        hello: String
      }
    `);
    this.root = {
      hello: () => 'Hello World!',
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
