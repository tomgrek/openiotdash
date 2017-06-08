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
  db.exec('create table if not exists users(id integer primary key, username varchar, password varchar, email varchar, apikey varchar)');
});

app.use(session({ secret: 'openiotdash', resave: true, saveUninitialized: true  }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', port);

app.use('/api', passportConfig.isAuthenticated, api);
app.use('/auth', auth.router);

app.get('/zig', (req, res) => {
  res.json({yay:'true'});
});
app.get('/user', (req, res) => {
  return res.json({name:'tom'});
});

async function start() {
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
