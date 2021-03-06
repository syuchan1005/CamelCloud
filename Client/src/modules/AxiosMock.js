import MockAdapter from 'axios-mock-adapter';

class AxiosMock {
  constructor(axios) {
    this.mock = new MockAdapter(axios);
    this.authRoute();
    this.graphQLRoute();
  }

  graphQLRoute() {
    this.mock.onPost('/api').reply((config) => {
      let str = JSON.parse(config.data).query;
      const map = ['DIRECTORY', 'FILE', 'TRASH'];
      map.forEach((v) => {
        str = str.replace(v, `'${v}'`);
      });
      if (str.startsWith('query')) {
        const query = AxiosMock.queryParser(str.substring(6, str.length - 1));
        if (query.user) {
          const data = {
            userId: 1,
            username: 'test',
            password: 'true',
            dirId: 1,
            twitterId: '2548450969',
            facebookId: null,
            instagramId: null,
            createdAt: 'Mon Feb 12 2018 19:33:04 GMT+0900 (東京 (標準時))',
            updatedAt: 'Mon Feb 12 2018 19:33:04 GMT+0900 (東京 (標準時))',
          };
          const user = {};
          query.user.requireArgs.forEach((k) => {
            user[k] = data[k];
          });
          return [200, { data: { user } }];
        } else if (query.files) {
          const files = [];
          if (query.files.fileFilter !== 'DIRECTORY') {
            files.push({
              name: 'test.png',
              type: 'FILE',
              thumb: true,
            });
          }
          if (!query.files.fileFilter) {
            for (let i = 0; i < 10; i += 1) {
              files.push({
                name: `${query.files.folderType || ''}Directory_${i}`,
                type: 'DIRECTORY',
              });
            }
            for (let i = 0; i < 10; i += 1) {
              files.push({
                name: `${query.files.folderType || ''}File_${i}`,
                type: 'FILE',
                thumb: false,
              });
            }
          } else {
            for (let i = 0; i < 10; i += 1) {
              const data = {
                name: `${query.files.folderType || ''}${query.files.fileFilter.substr(0, 1)}${query.files.fileFilter.substring(1).toLowerCase()}_${i}`,
                type: query.files.fileFilter,
              };
              if (data.type === 'FILE') data.thumb = false;
              files.push(data);
            }
          }
          return [200, { data: { files } }];
        }
      }
      return [401];
    });
    this.mock.onGet('/api/files').replyOnce(200);
    this.mock.onGet('/api/files').reply(404);
  }

  authRoute() {
    this.mock.onPost('/api/auth/local').reply((config) => {
      const data = JSON.parse(config.data);
      if (data.username === 'test' && data.password === '00602034e611c5c7e0c5b5e4fe6b8f27a0b7651ec26f55a0d76ffd9b7d21c276') { // name=test,pass=test
        return [200];
      }
      return [500];
    });
    this.mock.onGet('/api/auth').reply(200, {
      auth: true,
      userId: 1,
    });
    this.mock.onGet('/api/logout').reply(302, {}, {
      Location: '/',
    });
  }

  static queryParser(query) {
    const match = query.match(/{(.*)}/);
    const queryName = query.substring(0, match.index);
    const preQuery = `${queryName}${queryName.includes('(') ? ',' : ':{'}requireArgs: ['${match[1].replace(/ /g, '\',\'')}']}`.replace(/: /g, ':').replace(/ /g, ',').replace(/\(/g, ':{').replace(/\)/g, '');
    return eval(`({${preQuery}})`); // eslint-disable-line
  }
}

// noinspection JSUnusedGlobalSymbols
export default AxiosMock;
