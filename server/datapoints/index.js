import fetch from 'node-fetch';

import { Router } from 'express';
import { Datasink, Datapoint } from '../../models';

import { sendMsg } from '../socketEndpoints';

const schemaValidator = require('jsonschema').validate;

const vm = require('vm');
let parsedDatasinkScripts = {};

var router = Router();

// Any form encoded or JSON post data can be written to a datapoint, however, if it's a regular
// real/float recommend it is given a key called "value" -- e.g. { value: 0.314 }
// e.g. curl http://localhost:3000/d/w/c2928b4027d2e4/1 -X "POST" -v -d "value=3.1415"
// The value is intentionally left as a string -- we can't infer it from a single datapoint, and
// writes should be faster than read/analysis
router.post('/w/:writekey/:title', async (req, res, next) => {
  let token = req.params.writekey;
  if (token === 'PRIVATE') token = req.headers.authorization.substr(7);
  Datasink.findOne({
    attributes: [
      'writeKey',
      'readKey',
      'id',
      'definition',
      'schema',
    ],
    where: {
      title: req.params.title,
    },
  }).then(sink => {
    if (!sink) return res.status(400).end();
    if (sink.dataValues.writeKey !== token) return res.status(401).end();

    let data = req.body;
    if (data.mqtt) {
      // e.g. data.val here will be lng=-122.5&lat=37.1&val=112
      let queryString = decodeURIComponent(data.val);
      let obj = {};
      queryString.split('&').map(x => x.split('=')).map(y => obj[y[0]] = y[1]);
      data = obj;
    }

    if (sink.dataValues.schema) {
      try {
        let schema = JSON.parse(sink.dataValues.schema);
        for (let key of Object.keys(data)) {
          if (data[key] == parseFloat(data[key])) {
            data[key] = parseFloat(data[key]);
          }
        }
        let validatorResult = schemaValidator(data, schema);
        if (validatorResult.errors.length) return res.json({error:"Does not fit schema: " + validatorResult.errors[0].stack});
      } catch(e) {
        console.error(e);
        return res.json({error: "The specified schema is probably invalid JSON."});
      }
    }

    data = JSON.stringify(data);

    Datapoint.create({
      datasink: sink.dataValues.id,
      data,
    }).then(dp => {
      sendMsg(req.params.title, { data: dp.data, createdAt: dp.createdAt }); // broadcast to socketio channel
      if (sink.definition) {
        // TODO: dont pass in console to the context, once debugging complete
        let dataPoint = { data: dp.data, createdAt: dp.createdAt };
        let context = new vm.createContext({fetch, sink, console, dataPoint});
        let script = new vm.Script(sink.definition);
        if (!script) return res.status(400).end();
        script.runInContext(context);
      }
      return res.status(201).end();
    }).catch(e => {
      return res.status(500).end();
    });
  }).catch(e => {
    console.error(e);
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
      'schema',
    ],
    where: {
      title: req.params.title,
    },
  }).then(sink => {
    if (!sink) return res.status(400).end();
    if (sink.schema) return res.status(405).end();
    if (sink.dataValues.writeKey !== req.params.writekey) return res.status(401).end();
    let data = JSON.stringify({ value: req.params.value });
    Datapoint.create({
      datasink: sink.dataValues.id, // req.params.id,
      data,
    }).then(dp => {
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
router.get('/r/:readkey/:title', (req, res, next) => {
  let readkey = req.params.readkey;
  if (readkey === 'PRIVATE') readkey = req.headers.authorization.substr(7);
  Datasink.findOne({
    attributes: [
      'readKey',
      'id',
    ],
    where: {
      title: req.params.title,
    },
  }).then(sink => {
    if (!sink) return res.status(400).end();
    if (sink.dataValues.readKey !== readkey) return res.status(401).end();
    let limit = parseInt(req.query.limit) || undefined;
    let order = undefined;
    let key = req.query.key || undefined;
    let number = req.query.numeric || undefined;
    if (limit) order = [['createdAt', 'DESC']];
    if (req.query.orderBy) order = [req.query.orderBy.split(' ')];
    Datapoint.findAll({ attributes: [
        'data',
        'createdAt',
      ],
      where: {
        datasink: sink.dataValues.id,
      },
      limit,
      order,
    }).then(dp => {
      if (key) {
        if (number) {
          // e.g. curl http://localhost:3000/d/r/90ef6eb8c1766a/j8fg4f2\?limit\=2\&key\=value\&numeric=true
          return res.json(dp.map(x => parseFloat(JSON.parse(x.data)[key])));
        } else {
          return res.json(dp.map(x => JSON.parse(x.data)[key]));
        }
      } else {
        // always return an array of datapoints
        if (!Array.isArray(dp)) return res.json([dp]);
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

export default router;
