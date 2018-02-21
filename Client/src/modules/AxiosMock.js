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
    this.mock.onPost('/api').reply((config) => {
      let str = JSON.parse(config.data).query;
      const map = ['DIRECTORY', 'FILE', 'ALL', 'NORMAL', 'TRASH'];
      map.forEach((v) => {
        str = str.replace(v, `'${v}'`);
      });
      if (str.startsWith('query')) {
        const query = AxiosMock.queryParser(str.substring(6, str.length - 1));
        if (query.getUser) {
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
          const getUser = {};
          query.getUser.requireArgs.forEach((k) => { getUser[k] = data[k]; });
          return [200, { data: { getUser } }];
        } else if (query.getFiles) {
          query.getFiles.fileType = query.getFiles.fileType || 'ALL';
          query.getFiles.folderType = `${query.getFiles.folderType || 'NORMAL'}_`;
          const getFiles = [];
          if (query.getFiles.fileType === 'ALL') {
            for (let i = 0; i < 10; i += 1) {
              getFiles.push({
                name: `${query.getFiles.folderType}Directory_${i}`,
                type: 'DIRECTORY',
              });
            }
            for (let i = 0; i < 10; i += 1) {
              getFiles.push({
                name: `${query.getFiles.folderType}File_${i}`,
                type: 'FILE',
              });
            }
          } else {
            for (let i = 0; i < 10; i += 1) {
              getFiles.push({
                name: `${query.getFiles.folderType}${query.getFiles.fileType.substr(0, 1)}${query.getFiles.fileType.substring(1).toLowerCase()}_${i}`,
                type: query.getFiles.fileType,
              });
            }
          }
          return [200, { data: { getFiles } }];
        }
      }
      /*
       else if (str.startsWith('mutation')) {

      }
       */
      return [401];
    });
  }

  static queryParser(query) {
    const match = query.match(/{(.*)}/);
    const queryName = query.substring(0, match.index);
    const preQuery = `${queryName}${queryName.includes('(') ? ',' : ':{'}requireArgs: ['${match[1].replace(/ /g, '\',\'')}']}`.replace(/: /g, ':').replace(/ /g, ',').replace(/\(/g, ':{').replace(/\)/g, '');
    return eval(`({${preQuery}})`); // eslint-disable-line
  }
}

export default AxiosMock;
