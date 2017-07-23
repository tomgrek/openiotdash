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
      d.definition = req.body.definition;
      d.visibility = req.body.visibility;
      d.title = req.body.title;
      console.log(d);
      d.save().then(() => res.status(200).end());
    }
  });

});

router.get('/dashboards/delete', (req, res, next) => {
  let idAsArray = req.query.id;
  if (!Array.isArray(req.query.id)) {
    idAsArray = [req.query.id];
  }
  for (var id of idAsArray) {
    Dashboard.destroy({
      where: {
        id: parseInt(id),
        user: req.user.id,
      },
    });
  }
  // TODO: Wait until all dashboards delete successfully (Promise.all) before returning success
  res.status(200).end();
});

router.get('/dashboards/new', (req, res, next) => {
  Dashboard.findAll({
    where: {
      user: req.user.id,
    },
  }).then(d => {
    Dashboard.create({
        user: req.user.id,
        definition: '{}',
        title: `Untitled Dashboard ${d.length + 1}`,
        visibility: 0,
      }).then(newDash => {
        res.json(newDash);
      });
  });
});

export default router;
