import { Router } from 'express';

import dashboards from './dashboards';

var router = Router();

router.use(dashboards);

export default router;
