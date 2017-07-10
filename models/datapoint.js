const { sql, Sequelize } = require('./db');
import Datasink from './datasink';

const Datapoint = sql.define('datapoint', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  data: {
    type: Sequelize.TEXT,
  },
  datasink: {
    type: Sequelize.INTEGER,
  },
}, {
  timestamps: true,
});
Datapoint.sync();

export default Datapoint;
