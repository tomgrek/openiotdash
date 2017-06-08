'use strict';

const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;

import bcrypt from 'bcrypt';

let _db;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  _db.get('SELECT * FROM users WHERE id=?', [id]).then(user => {
    done(null, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
  _db.get('SELECT * from users WHERE email=?', [email]).then((user) => {
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return done(err);
      if (isMatch) return done(null, user);
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

exports.init = (db) => {
  _db = db;
};

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({status: 'bad', message: 'No token supplied, you need to be logged in to request this resource'});
};
