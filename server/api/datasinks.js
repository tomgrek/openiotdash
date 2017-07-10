import { Router } from 'express';
import { Datasink, Datapoint } from '../../models';
import { getKey, getUuid } from '../../config/utils_server';
import { baseUrl } from '../../components/config/config';

var router = Router();

router.post('/datasinks/add', (req, res, next) => {
  if (!req.user) return res.status(401).end();
  let uuid = getUuid();
  Datasink.create({
    user: req.user.id,
    readKey: getKey(req.user.apikey),
    writeKey: getKey(req.user.apikey + uuid),
    title: uuid,
    definition: '',
    visibility: 0,
  }).then(d => {
    res.json({ datasink: d, url: baseUrl + `/d/w/${d.dataValues.writeKey}/${d.dataValues.id}` });
  }).catch(e => {
    res.status(500).end();
  });
});

export default router;
