module.exports = {
  title: 'Dash built with OpenIoTDash',
  baseUrl: 'http://localhost:3000',
  host: 'localhost',
  port: '3000', // default port; also the master port if you are making a cluster
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
  gitUrl: null, //'https://api.github.com/repos/tomgrek/test-repoforcomponents/contents', // e.g. https://api.github.com/repos/[user]/[repo]/contents
  offlineScriptMaxLifetimeMillis: 10000, // scripts can run for max 10s then are killed
  offlineScriptsRunAtIntervalMillis: 10000, // not exact -- will be within +/- 100ms
  messageQueueBackend: 'dontcare', // 'dontcare' or 'redis' or 'kafka'
  messageQueueHost: 'localhost', // or 'localhost' (or per your setup)
  messageQueuePort: '2181', // or '6379' for redis or '2181' for kafka (or per your setup) or blank for dontcare
  kafka: { // If you just use kafka as a MQTT message queue, this can be blank, but maybe you want OITD to be a regular Kafka consumer/producer as well
    useKafka: true, // publish to Kafka on datapoint writes
    kafkaToMQTTTopics: [], // e.g. ['MYTOPIC']
  },
  certOptions: {
    // if you want to issue x509 certificates to devices, you can change these defaults for the cert.
    issuer: {
      commonName: 'Open IoT Project',
      orgName: 'Open IoT Project',
      shortName: 'My Open IoT Organizational Unit',
      locality: 'Bay Area',
      stateName: 'California',
    },
    monthsValid: 12, // months up to maximum 39
  },
};
