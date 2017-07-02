'use strict';

import Nuxt from 'nuxt';
import express from 'express';
import data from './data';
import auth from './auth';
import api from './api';

import models from '../models';

const db = require('sqlite');

async function openUserDb() {
  db.open('./openiotdash.db').then(() => {
    db.exec('create table if not exists users(id integer primary key, username varchar, password varchar, email varchar, apikey varchar)');
  });
}

async function start() {

  const passport = require('passport');
  const passportConfig = require('../config/passport');
  passportConfig.init(db);
  auth.init(db);

  const session = require('express-session');
  const SQLiteStore = require('connect-sqlite3')(session);
  const bodyParser = require('body-parser');

  // asyncData methods are called server-side; reject external attempts to GET those urls.
  const localhostChecker = require('../plugins/localhost-checker');

  const app = express();
  const host = process.env.HOST || '127.0.0.1';
  const port = process.env.PORT || 3000;
  app.set('port', port);

  app.use(session({
    secret: 'openiotdash',
    resave: true,
    saveUninitialized: true,
    store: new SQLiteStore({
      table: 'sessions',
      db: 'openiotdash_session',
    }),
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/data', localhostChecker.check, data);
  app.use('/api', passportConfig.isAuthenticated, api);
  app.use('/auth', auth.router);

  await openUserDb();
  let config = require('../nuxt.config.js');
  config.dev = !(process.env.NODE_ENV === 'production');
  const nuxt = new Nuxt(config);
  app.use(nuxt.render);
  app.listen(port, host);
  console.log('Server listening on ' + host + ':' + port);
}

start();

module.exports = {
  db,
};
