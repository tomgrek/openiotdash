'use strict';

import bcrypt from 'bcrypt';
import User from '../models/user';

const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findOne({
    attributes: [
      'username',
      'email',
      'apikey',
      'id',
    ],
    where: {
      id,
    },
  }).then(user => {
    return done(null, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
  User.findOne({
    attributes: [
      'username',
      'password',
      'id',
      'apikey',
      'email',
    ],
    where: {
      email,
    },
  }).then(user => {
    if (!user) return done(null, false, { msg: `Email ${email} not found.` });
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return done(err);
      if (isMatch) return done(null, user);
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.json({status: 'bad', message: 'No token supplied, you need to be logged in to request this resource'});
};
