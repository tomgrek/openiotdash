'use strict';

const mosca = require('mosca');
let FormData = require('form-data');

import { baseUrl } from '../components/config/config';

const fetch = require('node-fetch');

const mqttServer = new mosca.Server({ port: 1883 });

mqttServer.on('published', function(packet, client) {

  if (packet.qos === undefined) return false; // it's a client connect/disconnect msg

  const sinkTitle = packet.topic.split('/')[1];
  const writeKey = packet.topic.split('/')[0];
  const value = packet.payload.toString();

  fetch(`${baseUrl}/d/w/${writeKey}/${sinkTitle}`, { headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }, method: 'POST', body: `mqtt=true&val=${value}`})
    .then(r => {
      console.log(r.status);
    })
    .catch(console.log);

});
