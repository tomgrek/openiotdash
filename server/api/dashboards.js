import { Router } from 'express';

var router = Router();

router.get('/dashboards', (req, res, next) => {
  res.json(['tom']);
});

export default router;
