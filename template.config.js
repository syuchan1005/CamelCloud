module.exports = {
  baseURL: `http://localhost:${process.env.port || 3000}`,
  databaseURL: 'sqlite:data/db.sqlite3',
  auth: {
    local: {
      enable: true,
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
