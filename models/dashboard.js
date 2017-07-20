const { sql, Sequelize } = require('./db');

const Dashboard = sql.define('dashboard', {
  user: {
    type: Sequelize.INTEGER,
  },
  title: {
    type: Sequelize.STRING, // VARCHAR 255
  },
  definition: {
    type: Sequelize.TEXT,
  },
  visibility: {
    type: Sequelize.INTEGER, // 0 = private, 1 = visible with link (ie public but unlisted)
  },
  link: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: true,
});

Dashboard.sync();

export default Dashboard;
