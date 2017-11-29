/* Routes here are accessed via /apina/[route] */

import { Router } from 'express';

import dataSinksNoAuth from './datasinks_noauth';
import time from './time';

var router = Router();

router.use(dataSinksNoAuth);
router.use(time);

export default router;
