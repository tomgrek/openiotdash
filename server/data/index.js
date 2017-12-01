import { Router } from 'express';

import dashboards from './dashboards';
import datasinks from './datasinks';
import devices from './devices';

var router = Router();

router.use(dashboards);
router.use(datasinks);
router.use(devices);

export default router;
