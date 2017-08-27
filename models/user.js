// create table if not exists users(id integer primary key, username varchar, password varchar, email varchar, apikey varchar

const { sql, Sequelize } = require('./db');

const User = sql.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.STRING, // VARCHAR 255
  },
  password: {
    type: Sequelize.TEXT,
  },
  email: {
    type: Sequelize.STRING,
  },
  apikey: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: true,
});

User.sync();

export default User;
