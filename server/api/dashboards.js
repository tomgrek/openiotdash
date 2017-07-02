import { Router } from 'express';
import { Dashboard } from '../../models';

var router = Router();

router.post('/dashboards/save/:what', (req, res, next) => {
  Dashboard.findOne({
    where: {
      user: req.user.id,
      id: req.body.id,
    },
  }).then(d => {
    if (req.params.what === 'title') {
      d.title = req.body.title;
      d.save().then(() => res.status(200).end());
    }
  });

});

export default router;
