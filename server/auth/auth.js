import { Router } from 'express';
import passport from 'passport';

import bcrypt from 'bcrypt';
import crypto from 'crypto';

let _db;

const router = Router();

router.post('/signup', (req, res, next) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    if (!req.body.password) return next({ error: 'No password' });
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) return next(err);
      let apiKey = crypto.createHash('md5').update(req.body.email).digest('hex').slice(2,12);
      _db.run('INSERT INTO users VALUES(NULL,?,?,?,?)', [req.body.email, hash, req.body.email, apiKey]);
      res.json({});
    });
  });
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

const init = db => _db = db;

export default {
  router,
  init,
};
