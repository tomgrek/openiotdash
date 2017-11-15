const { sql, Sequelize } = require('./db');

const Datasink = sql.define('datasink', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user: {
    type: Sequelize.INTEGER,
  },
  readKey: {
    type: Sequelize.STRING,
  },
  writeKey: {
    type: Sequelize.STRING,
  },
  title: { // user given title
    type: Sequelize.STRING,
  },
  definition: {
    type: Sequelize.TEXT,
  },
  visibility: {
    type: Sequelize.INTEGER, // 0 = private, 1 = visible with link (ie public but unlisted)
  },
  schema: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: true,
});
Datasink.sync();

export default Datasink;
