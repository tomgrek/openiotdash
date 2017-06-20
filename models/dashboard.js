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
}, {
  timestamps: true,
});

// Dashboard.sync(/*{force: true}*/).then(() => {
//   return Dashboard.create({
//     user: 4,
//     definition: '{}',
//     title: "Tom's Dashboard 1",
//   });
// });

export default Dashboard;
