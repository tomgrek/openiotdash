import { Router } from 'express';
import { Device } from '../../models';
import { getKey, getUuid, validateTitle } from '../../config/utils_server';
import { baseUrl, certOptions } from '../../components/config/config';

const certgen = require('self-cert');

var router = Router();

router.get('/devices/create', async (req, res, next) => {
  // Datasink.update({ schema: req.body.schema }, { where: { id: req.body.id, user: req.user.id, }}).then(() => {
  //   return res.status(200).end();
  // }).catch(() => res.status(500).end());
  let now = new Date();
  let to = new Date(now.setMonth(now.getMonth() + certOptions.monthsValid));
  let certificate = certgen({
    attrs: certOptions.issuer,
    expires: to,
  });
  let d = await Device.create({
    user: req.user.id,
    cert: certificate.certificate,
    publicKey: certificate.publicKey,
    privateKey: certificate.privateKey,
    from: now,
    to,
    
  });
  return res.json({certificate});
});

router.post('/devices/delete', (req, res, next) => {
  // Datasink.update({ definition: req.body.definition }, { where: { id: req.body.id, user: req.user.id, }}).then(() => {
  //   return res.status(200).end();
  // }).catch(() => res.status(500).end());
});

export default router;
