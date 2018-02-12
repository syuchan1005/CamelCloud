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
      userId: 1,
      username: 'syu_chan_1005',
      password: true,
      dirId: 1,
      twitterId: 123456879,
      facebookId: 987654321,
      instagramId: undefined,
      createdAt: '',
      updatedAt: '',
    });
  }
}

export default AxiosMock;
