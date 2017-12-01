import { Router } from 'express';
import { Device } from '../../models';

var router = Router();

router.get('/devices/:user', (req, res, next) => {
  Device.findAll({
    attributes: [
      'id',
      'cert',
      'privateKey', // TODO should not store the private key
      'publicKey',
      'from',
      'to',
    ],
    where: {
      user: req.params.user,
    },
  }).then(devices => {
    res.json({ devices });
  });
});

export default router;
