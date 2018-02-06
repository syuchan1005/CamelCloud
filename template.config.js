module.exports = {
  baseURL: `http://localhost:${process.env.port || 3000}`,
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
    },
  },
};
