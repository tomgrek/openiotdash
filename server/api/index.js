import { Router } from 'express';

import dashboards from './dashboards';
import datasinks from './datasinks';

var router = Router();

router.use(dashboards);
router.use(datasinks);

export default router;
