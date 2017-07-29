import { Router } from 'express';
import { Datasink, Datapoint } from '../../models';

import { sendMsg } from '../socketEndpoints';

var router = Router();

// Any form encoded or JSON post data can be written to a datapoint, however, if it's a regular
// real/float recommend it is given a key called "value" -- e.g. { value: 0.314 }
// e.g. curl http://localhost:3000/d/w/c2928b4027d2e4/1 -X "POST" -v -d "value=3.1415"
// The value is intentionally left as a string -- we can't infer it from a single datapoint, and
// writes should be faster than read/analysis
router.post('/w/:writekey/:id', (req, res, next) => {
  Datasink.findOne({
    attributes: [
      'writeKey',
    ],
    where: {
      id: req.params.id,
    },
  }).then(sink => {
    if (!sink) return res.status(400).end();
    if (sink.dataValues.writeKey !== req.params.writekey) return res.status(401).end();
    let data = req.body;
    data = JSON.stringify(req.body);
    Datapoint.create({
      datasink: req.params.id,
      data,
    }).then(dp => {
      sendMsg(req.params.id, data); // broadcast to socketio channel
      return res.status(201).end();
    }).catch(e => {
      return res.status(500).end();
    });
  }).catch(e => {
    return res.status(500).end();
  });
});

// GET endpoint for very simple devices/code that can't post with POST
// data is stored as JSON { value: [val] }
router.get('/w/:writekey/:title/:value', (req, res, next) => {
  Datasink.findOne({
    attributes: [
      'writeKey',
      'id',
    ],
    where: {
      title: req.params.title,
    },
  }).then(sink => {
    if (!sink) return res.status(400).end();
    if (sink.dataValues.writeKey !== req.params.writekey) return res.status(401).end();
    let data = JSON.stringify({ value: req.params.value });
    Datapoint.create({
      datasink: sink.dataValues.id, // req.params.id,
      data,
    }).then(dp => { // LOOKS LIKE THIS SHOULD BE value: val ... no shortcuts
      sendMsg(req.params.title, { data: dp.data, createdAt: dp.createdAt }); // broadcast to socketio channel
      return res.status(201).end();
    }).catch(e => {
      return res.status(500).end();
    });
  }).catch(e => {
    return res.status(500).end();
  });
});

// GET endpoint for very simple devices/code
// data is stored as JSON { value: [val] }
router.get('/r/:readkey/:id', (req, res, next) => {
  Datasink.findOne({
    attributes: [
      'readKey',
    ],
    where: {
      id: req.params.id,
    },
  }).then(sink => {
    if (!sink) return res.status(400).end();
    if (sink.dataValues.readKey !== req.params.readkey) return res.status(401).end();
    let limit = parseInt(req.query.limit) || undefined;
    let order = undefined;
    let key = req.query.key || undefined;
    let number = req.query.numeric || undefined;
    if (limit) order = [['createdAt', 'DESC']];
    if (req.query.orderBy) order = [req.query.orderBy.split(' ')];
    console.log(order);
    Datapoint.findAll({ attributes: [
        'data',
        'createdAt',
      ],
      where: {
        datasink: req.params.id,
      },
      limit,
      order,
    }).then(dp => {
      if (key) {
        if (number) {
          // e.g. curl http://localhost:3000/d/r/90ef6eb8c1766a/1\?limit\=2\&key\=value\&numeric=true
          return res.json(dp.map(x => parseFloat(JSON.parse(x.data)[key])));
        } else {
          return res.json(dp.map(x => JSON.parse(x.data)[key]));
        }
      } else {
        return res.json(dp);
      }
    }).catch(e => {
      console.log(e);
      return res.status(500).end();
    });
  }).catch(e => {
    console.log(e);
    return res.status(500).end();
  });
});

// TODO: NEXT: Endpoint for reading data with a ?qs to specify range
// Make this data appear on a component (using asyncData) as component.data.[datasinkTitle]. It'll have to be manually specced
// on a predefined component for now, until save/load dashboard is working.

export default router;
