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
        },
        facebookId: {
          type: Sequelize.TEXT,
        },
        instagramId: {
          type: Sequelize.TEXT,
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
      file: this.db.define('File', {
        fileId: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        directoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: 'sameFile',
        },
        ownerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: 'sameFile',
        },
        fileType: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: 'sameFile',
        },
      }),
    };
  }

  syncModels() {
    return Promise.all(Object.values(this.models).map(v => v.sync()));
  }

  async getUser(userId) {
    const user = await this.models.user.findOne({
      where: {
        userId,
      },
    });
    return user ? user.dataValues : undefined;
  }

  async addUser(username, auth) {
    let user = await this.models.user.create({ username });
    const hash = DBManager.sha256(DBManager.sha256(username) + user.dataValues.createdAt);
    const dir = await this.models.directory.create({
      ownerId: user.dataValues.userId,
      name: hash,
    });

    const data = auth;
    if (data.password) {
      let pass = data.password;
      for (let i = 0; i < 2; i += 1) {
        pass = DBManager.sha256(DBManager.sha256(pass) + user.dataValues.createdAt);
      }
      delete data.password;
      data.hash = pass;
    }

    user = await user.update(Object.assign({
      dirId: dir.dataValues.directoryId,
    }, data));
    return user.dataValues;
  }

  async findOrCreateUser(username, auth) {
    let user = await this.models.user.findOne({
      where: {
        username,
      },
    });
    if (user) {
      user = user.dataValues;
    } else {
      user = await this.addUser(username, auth);
    }
    return user;
  }

  static sha256(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
  }
}

export default DBManager;
