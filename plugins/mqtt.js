'use strict';

import { baseUrl } from '../components/config/config';

const fetch = require('node-fetch');
const mosca = require('mosca');
const FormData = require('form-data');

let createMqttStuff = (server) => {
  const mqttServer = new mosca.Server({ host: 'localhost', port: 1883 });
  mqttServer.attachHttpServer(server);
  mqttServer.on('published', function(packet, client) {
    console.log(packet);
    return false;
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
};
module.exports = createMqttStuff;
