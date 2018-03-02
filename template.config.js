module.exports = {
  /* Other Service Callback URL */
  baseURL: 'http://localhost:3000',
  /* true => GET /api (after login) */
  graphiql: false,
  /* UserData store DB (can use postgres, mysql, sqlite, SQLServer) */
  connectionURI: 'sqlite:test.db',
  /* Files Save Directory */
  storage: 'Storage',
  /* WebPage Explorer Path Separator */
  separator: {
    value: '/',
    icon: false,
  },
  /* Login */
  auth: {
    local: {
      stretch: 1000,
    },
    twitter: {
      enable: false,
      consumerKey: '...',
      consumerSecret: '...',
    },
    facebook: {
      enable: false,
      appID: '...',
      appSecret: '...',
    },
    instagram: {
      enable: false,
      clientID: '...',
      clientSecret: '...',
    },
  },
};
