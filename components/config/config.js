module.exports = {
  title: 'Dash built with OpenIoTDash',
  baseUrl: 'http://localhost:3000',
  host: 'localhost',
  port: '3000',
  headerOptions: {
    headerImage: '~assets/img/headerimg.png',
    headerText: 'My Dashboard',
    displayUsername: true,
  },
  indexOptions: {
    title: 'Welcome to my Open IoT Dashboard',
  },
  dbms: 'sqlite3', // sqlite3 | postgres
  dbhost: 'localhost',
  dbuser: 'openiotdash',
  dbpassword: 'openiotdash',
  gitUrl: 'https://api.github.com/repos/tomgrek/test-repoforcomponents/contents', // e.g. https://api.github.com/repos/[user]/[repo]/contents
};
