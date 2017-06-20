import { Router } from 'express';

const router = Router();

router.get('/username', (req, res, next) => {
  return res.json(req.user ? req.user.username : null);
});

export default router;
