import { Router } from 'express';
import { Dashboard } from '../../models';

var router = Router();

router.get('/dashboards/:user', (req, res, next) => {
  Dashboard.findAll({
    attributes: [
      'id',
      'updatedAt',
      'title',
      'link',
      'visibility',
      'scheme',
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
      'link',
      'scheme',
    ],
    where: {
      id: req.params.id,
    },
  }).then(dashboard => {
    res.json(dashboard);
  });
});

router.get('/dashboard_link/:link', (req, res, next) => {
  Dashboard.findOne({
    attributes: [
      'updatedAt',
      'createdAt',
      'title',
      'definition',
      'link',
      'scheme',
    ],
    where: {
      link: req.params.link,
      visibility: 1,
    },
  }).then(dashboard => {
    res.json(dashboard);
  });
});

export default router;
