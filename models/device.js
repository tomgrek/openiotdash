const { sql, Sequelize } = require('./db');

const Device = sql.define('device', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user: {
    type: Sequelize.INTEGER,
  },
  cert: {
    type: Sequelize.TEXT,
  },
  publicKey: {
    type: Sequelize.TEXT,
  },
  privateKey: {
    type: Sequelize.TEXT,
  },
  from: {
    type: Sequelize.BIGINT,
  },
  to: {
    type: Sequelize.BIGINT,
  },
}, {
  timestamps: true,
});
Device.sync();

export default Device;
