import MockAdapter from 'axios-mock-adapter';

class AxiosMock {
  constructor(axios) {
    this.mock = new MockAdapter(axios);
    this.authRoute();
  }

  authRoute() {
    this.mock.onPost('/api/auth/local').reply(200);
    this.mock.onGet('/api/auth').reply(200, {
      authed: true,
      userId: 1,
    });
    this.mock.onGet('/api/logout').reply(302, {}, {
      Location: '/',
    });
    this.mock.onPost('/api').reply(200, {
      data: {
        getUser: {
          userId: 1,
          username: 'test',
          password: 'true',
          dirId: 1,
          twitterId: null,
          facebookId: null,
          instagramId: null,
          createdAt: 'Mon Feb 12 2018 19:33:04 GMT+0900 (東京 (標準時))',
          updatedAt: 'Mon Feb 12 2018 19:33:04 GMT+0900 (東京 (標準時))',
        },
      },
    });
  }
}

export default AxiosMock;
