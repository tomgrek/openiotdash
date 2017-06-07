'use strict';

import { Router } from 'express';

import auth from './auth';

const router = Router();
let _db;

router.use(auth.router);

const init = db => {
  _db = db;
  auth.init(_db);
};

export default {
  router,
  init,
};
