module.exports = {
  baseURL: 'http://localhost:3000',
  graphiql: false,
  databaseURL: 'sqlite:test.db',
  storage: 'Storage',
  separator: {
    value: '/',
    icon: false,
  },
  auth: {
    local: {
      salt: 'passwordSalt',
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
