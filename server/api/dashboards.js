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
    if (req.params.what === 'visibility') {
      d.visibility = req.body.visibility;
      d.save().then(() => res.status(200).end());
    }
    if (req.params.what === 'all') {
      console.log(req.body.definition);
      d.definition = req.body.definition;
      d.save().then(() => res.status(200).end());
    }
  });

});

export default router;
