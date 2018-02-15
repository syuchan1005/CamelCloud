module.exports = {
  baseURL: 'http://localhost:3000',
  databaseURL: 'sqlite:test.db',
  storage: '../Storage',
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
