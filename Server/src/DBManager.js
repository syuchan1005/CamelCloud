import Sequelize from 'sequelize';
import debug from 'debug';
import crypto from 'crypto';

import { databaseURI } from '../../config';


class DBManager {
  constructor() {
    this.logging = debug('camelcloud-db');
    this.db = new Sequelize(databaseURI, {
      logging: this.logging,
      operatorsAliases: Sequelize.Op,
    });
  }

  async authenticate() {
    await this.db.authenticate();
    this.createModels();
    await this.syncModels();
  }

  createModels() {
    this.models = {
      user: this.db.define('User', {
        userId: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: true,
        },
        hash: {
          type: Sequelize.TEXT,
        },
        dirName: {
          type: Sequelize.TEXT,
        },
        twitterId: {
          type: Sequelize.TEXT,
          unique: true,
        },
        facebookId: {
          type: Sequelize.TEXT,
          unique: true,
        },
        instagramId: {
          type: Sequelize.TEXT,
          unique: true,
        },
      }),
    };
  }

  syncModels() {
    return Promise.all(Object.values(this.models).map(v => v.sync()));
  }

  async getUser(auth) {
    const where = typeof auth !== 'object' ? { userId: auth } : auth;
    const user = await this.models.user.findOne({ where });
    return user || Promise.reject(new Error('User Not Found'));
  }

  async updateUser(userId, userData) {
    let user = await this.models.user.findOne({
      where: {
        userId,
      },
    });
    const data = userData;
    if (data.password) {
      data.hash = DBManager.passwordStretch(data.password, user.createdAt);
      delete data.password;
    }
    user = await user.update(data);
    return user;
  }

  async addUser(username, password) {
    let user = await this.models.user.create({ username });
    const data = {
      dirName: DBManager.sha256(DBManager.sha256(username) + user.createdAt),
      hash: DBManager.passwordStretch(password, user.createdAt),
    };

    user = await user.update(data);
    return user;
  }

  async findOrCreateUser(username, password) {
    let user = await this.getUser({ username }).catch(() => /* ignored */ undefined);
    if (user) {
      if (user.hash !== DBManager.passwordStretch(password, user.createdAt)) {
        return Promise.reject(new Error('User Not Found'));
      }
    } else {
      user = await this.addUser(username, password);
    }
    return user;
  }

  static passwordStretch(password, salt) {
    let pass = password;
    for (let i = 0; i < 2; i += 1) {
      pass = DBManager.sha256(DBManager.sha256(pass) + salt);
    }
    return pass;
  }

  static sha256(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
  }
}

export default DBManager;
