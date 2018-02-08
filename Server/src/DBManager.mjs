import Sequelize from 'sequelize';

class DBManager {
  constructor() {
      this.db = new Sequelize();
  }
}

export default DBManager;
