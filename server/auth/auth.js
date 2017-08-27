import { Router } from 'express';
import passport from 'passport';

import User from '../../models/user';

import bcrypt from 'bcrypt';
import crypto from 'crypto';

import whoami from './whoami/';

const router = Router();
router.use('/whoami', whoami);

router.post('/signup', (req, res, next) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    if (!req.body.password) return next({ error: 'No password' });
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) return next(err);
      let apiKey = crypto.createHash('md5').update(req.body.email).digest('hex').slice(2,12);
      User.create({
        username: req.body.email,
        email: req.body.email,
        password: hash,
        apikey: apiKey,
      }).then(user => {
          req.logIn(user, err => {
            if (err) console.log(err);
            res.redirect('/');
          });
      });
    });
  });
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.status(200).end();
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({status: 'bad', message: 'User not found.'});
    } else {
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    }
  })(req, res, next);
});

export default {
  router,
};
