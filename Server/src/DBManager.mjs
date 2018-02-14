import Sequelize from 'sequelize';
import debug from 'debug';
import crypto from 'crypto';

import { databaseURI } from '../../config';


class DBManager {
  constructor() {
    this.logging = debug('picstorage-db');
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
        dirId: {
          type: Sequelize.INTEGER,
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
      directory: this.db.define('Directory', {
        directoryId: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        parentId: {
          type: Sequelize.INTEGER,
          unique: 'sameDirectory',
        },
        ownerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: 'sameDirectory',
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: 'sameDirectory',
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
    return user ? user.dataValues : Promise.reject(new Error('User Not Found'));
  }

  async updateUser(userId, userData) {
    let user = await this.models.user.findOne({
      where: {
        userId,
      },
    });
    const data = userData;
    if (data.password) {
      data.hash = DBManager.sha256(DBManager.sha256(userData.username || user.username)
        + user.dataValues.createdAt);
      delete data.password;
    }
    user = await user.update(data);
    return user.dataValues;
  }

  async addUser(username, password) {
    let user = await this.models.user.create({ username });
    const hash = DBManager.sha256(DBManager.sha256(username) + user.dataValues.createdAt);
    const dir = await this.models.directory.create({
      ownerId: user.dataValues.userId,
      name: hash,
    });

    const data = {
      dirId: dir.dataValues.directoryId,
      hash: DBManager.passwordStretch(password, user.dataValues.createdAt),
    };

    user = await user.update(data);
    return user.dataValues;
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
