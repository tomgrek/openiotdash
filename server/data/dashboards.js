import { Router } from 'express';
import { Dashboard } from '../../models';

var router = Router();

router.get('/dashboards/:user', (req, res, next) => {
  Dashboard.findAll({
    attributes: [
      'id',
      'updatedAt',
      'title',
    ],
    where: {
      user: req.params.user,
    },
  }).then(dashboards => {
    res.json(dashboards);
  });
});

router.get('/dashboard/:id', (req, res, next) => {
  Dashboard.findOne({
    attributes: [
      'updatedAt',
      'createdAt',
      'title',
      'definition',
      'visibility',
    ],
    where: {
      id: req.params.id,
    },
  }).then(dashboard => {
    res.json(dashboard);
  });
});

export default router;
