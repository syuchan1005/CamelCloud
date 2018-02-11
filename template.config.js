module.exports = {
  baseURL: 'http://localhost:3000',
  databaseURL: 'sqlite:data/db.sqlite3',
  auth: {
    local: {
      enable: true,
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
