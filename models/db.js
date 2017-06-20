import Sequelize from 'sequelize';

const sql = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: './openiotdash_objects.db'
});

module.exports = {
  sql,
  Sequelize,
};
