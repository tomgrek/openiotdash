'use strict';

import { Nuxt, Builder } from 'nuxt';
import express from 'express';
import data from './data';
import auth from './auth';
import api from './api';
import authNotNeed from './auth_not_need';
import datapoints from './datapoints';

import models from '../models';
import User from '../models/user';

const sql = require('../models/db').sql;

let io = null;

async function start() {

  const passport = require('passport');
  const cluster = require('cluster');
  const passportConfig = require('../config/passport');
  const passportSocketIo = require('passport.socketio');

  const session = require('express-session');
  const SequelizeStore = require('connect-session-sequelize')(session.Store);
  const sessionStore = new SequelizeStore({
    db: sql,
  });
  sessionStore.sync();
  const bodyParser = require('body-parser');
  const cookieParser = require('cookie-parser');

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
    store: sessionStore,
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/data', localhostChecker.check, data);
  app.use('/api', passportConfig.isAuthenticated, api);
  app.use('/d', datapoints);
  app.use('/auth', auth.router);
  app.use('/apina', authNotNeed);

  let config = require('../nuxt.config.js');
  config.dev = !(process.env.NODE_ENV === 'production');
  const nuxt = new Nuxt(config);

  if (config.dev) {
    const builder = new Builder(nuxt);
    builder.build();
  }
  var server = require('http').createServer(app); //require('http').Server(app);

  if (cluster.isMaster) {
    io = require('socket.io')(server);
    io.use(passportSocketIo.authorize({
      key: 'connect.sid',
      secret: 'openiotdash',
      store: sessionStore,
      passport: passport,
      cookieParser: cookieParser
    }));
    const socketFns = require('./socketEndpoints');
    socketFns.init(io);
    io.on('connection', (socket) => {
      socketFns.subscribeUser(socket, socket.request.user.id);
    });
    // mqtt settings (including MQ, persistence) are in this file.
    require('../plugins/mqtt')(server);
    require('./offlineProcessing').doOffline();
  }

  app.use(nuxt.render);
  //app.listen(port, host);
  server.listen(port, host);
  console.log('Server listening on ' + host + ':' + port);
}

start();
module.exports = {
  sql,
};
