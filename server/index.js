import Nuxt from 'nuxt';
import express from 'express';

import api from './api';
import auth from './auth';

const db = require('sqlite');
const passport = require('passport');
const passportConfig = require('../config/passport');
passportConfig.init(db);
auth.init(db);

const session = require('express-session');
const bodyParser = require( 'body-parser' );

const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

db.open('./openiotdash.sqlite').then(() => {
  db.exec('create table if not exists users(id integer primary key, username varchar, password varchar, email varchar, apikey varchar)', console.log);
});

app.use(session({ secret: 'openiotdash', resave: true, saveUninitialized: true  }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', port);

app.use('/api', passportConfig.isAuthenticated, api);
app.use('/auth', auth.router);

// Start nuxt.js
async function start() {
  // Import and Set Nuxt.js options
  let config = require('../nuxt.config.js')
  config.dev = !(process.env.NODE_ENV === 'production')
  // Instanciate nuxt.js
  const nuxt = new Nuxt(config)
  // Add nuxt.js middleware
  app.use(nuxt.render)
  // Listen the server
  app.listen(port, host)
  console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
}

start()

module.exports = {
  db,
};
