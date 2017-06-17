import { Router } from 'express';

var router = Router();

router.get('/dashboards', (req, res, next) => {
  res.json(['dash1', 'dash2']);
});

export default router;
