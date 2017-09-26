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
  offlineScriptMaxLifetimeMillis: 10000, // scripts can run for max 10s then are killed
  offlineScriptsRunAtIntervalMillis: 10000, // not exact -- will be within +/- 100ms
  messageQueueBackend: 'dontcare', // or 'redis' or 'kafka'
  messageQueueHost: '', // or 'localhost' (or per your setup)
  messageQueuePort: '', // or '6379' for redis or '2181' for kafka (or per your setup)
};
