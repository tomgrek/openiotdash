import { Router } from 'express';
import { Datasink } from '../../models';
import { getKey, getUuid, validateTitle } from '../../config/utils_server';
import { baseUrl } from '../../components/config/config';

import { addTopic, removeTopic } from '../../plugins/kafkaconsumer.js';

var router = Router();

router.post('/datasinks/saveCode', (req, res, next) => {
  Datasink.update({ definition: req.body.definition }, { where: { id: req.body.id, user: req.user.id, }}).then(() => {
    return res.status(200).end();
  }).catch(() => res.status(500).end());
});

router.post('/datasinks/rename', (req, res, next) => {
  if (!validateTitle(req.body.title)) return res.status(400).end();
  Datasink.findOne({
    where: {
      title: req.body.title,
    },
  }).then(sink => {
    if (sink) {
      return res.status(409).end();
    }
    Datasink.update({ title: req.body.title }, { where: { id: req.body.id, user: req.user.id, }}).then(() => {
      return res.status(200).end();
    }).catch(() => res.status(500).end());
  });
});

router.post('/datasinks/add', (req, res, next) => {
  if (!req.user) return res.status(401).end();
  let uuid = getUuid();
  Datasink.create({
    user: req.user.id,
    readKey: getKey(req.user.apikey), // readKey will be the same for all datasinks for a given user .. thats ok right now
    writeKey: getKey(req.user.apikey + uuid),
    title: uuid,
    definition: '',
    visibility: 0,
  }).then(d => {
    addTopic(d.dataValues.writeKey, d.dataValues.title);
    res.json({ datasink: d, url: baseUrl + `/d/w/${d.dataValues.writeKey}/${d.dataValues.title}` });
  }).catch(e => {
    res.status(500).end();
  });
});

router.get('/datasinks/delete', (req, res, next) => {
  let idAsArray = req.query.id;
  if (!Array.isArray(req.query.id)) {
    idAsArray = [req.query.id];
  }
  for (let id of idAsArray) {
    Datasink.findOne({
      attributes: [
        'writeKey',
        'title',
      ],
      where: {
        id: parseInt(id),
      },
    }).then(datasink => {
      Datasink.destroy({
        where: {
          id: parseInt(id),
          user: req.user.id,
        },
      });
      try {
        removeTopic(datasink.dataValues.writeKey, datasink.dataValues.title);
      } catch(e) {
        console.error('It appears you have Kafka enabled, but the server is not responding');
      }
    });
  }
  res.status(200).end();
});

router.post('/datasinks/changeVisibility', (req, res, next) => {
  if (!req.user) return res.status(401).end();
  Datasink.update({
    visibility: parseInt(req.body.visibility),
  }, { where: {
    id: parseInt(req.body.id),
    user: req.user.id,
    }
  }).then(() => {
    return res.status(200).end();
  }).catch(e => {
    console.log(e);
    res.status(500).end();
  });
});

export default router;
