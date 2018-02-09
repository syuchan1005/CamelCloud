import Sequelize from 'sequelize';
import debug from 'debug';

import { databaseURI } from '../../config';


class DBManager {
  constructor() {
    this.logging = debug('picstorage-db');
    this.db = new Sequelize(databaseURI, {
      logging: this.logging,
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
          allowNull: false,
        },
        dirId: {
          type: Sequelize.INTEGER,
        },
        twitterToken: {
          type: Sequelize.TEXT,
        },
        facebookToken: {
          type: Sequelize.TEXT,
        },
        instagramToken: {
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
}

export default DBManager;
