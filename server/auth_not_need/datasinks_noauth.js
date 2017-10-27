import { Router } from 'express';
import { Datasink } from '../../models';

var router = Router();

router.get('/datasinks/getReadKey/:id', (req, res, next) => {
  if (!req.user) {
    // is it a public data sink?
    Datasink.findOne({
      attributes: [
        'readKey',
        'title',
      ],
      where: {
        visibility: 1,
        id: req.params.id,
      },
    }).then(ds => {
      res.send(ds);
      res.end();
    }).catch(e => {
      console.log(e);
      return res.status(500).end();
    });
  } else {
    Datasink.findOne({
      attributes: [
        'readKey',
        'title',
      ],
      where: {
        user: req.user.id,
        id: req.params.id,
      },
    }).then(ds => {
      res.send(ds);
      return res.end();
    }).catch(e => {
      console.log(e);
      res.status(500).end();
    });
  }
});

export default router;
