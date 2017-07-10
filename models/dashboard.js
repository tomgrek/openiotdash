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
}, {
  timestamps: true,
});

Dashboard.sync();

// Dashboard.sync(/*{force: true}*/).then(() => {
//   return Dashboard.create({
//     user: 4,
//     definition: '{}',
//     title: "Tom's Dashboard 1",
//   });
// });

export default Dashboard;
