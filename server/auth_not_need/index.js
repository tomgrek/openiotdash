import { Router } from 'express';

import dataSinksNoAuth from './datasinks_noauth';

var router = Router();

router.use(dataSinksNoAuth);

export default router;
