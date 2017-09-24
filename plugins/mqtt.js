'use strict';

import { baseUrl } from '../components/config/config';

const fetch = require('node-fetch');
const mosca = require('mosca');

let createMqttStuff = (server) => {
  let pubsubsettings = {
    type: 'redis',
    redis: require('redis'),
    db: 0,
    port: 6379,
    return_buffers: true,
    host: 'localhost'
  };
  const mqttServer = new mosca.Server({ host: 'localhost', port: 1883, persistence: { factory: mosca.persistence.Redis } });
  mqttServer.attachHttpServer(server);
  mqttServer.on('published', function(packet, client) {
    if (packet.qos === undefined) return false; // it's a client connect/disconnect msg
    const command = packet.topic.split('/')[0];
    if (command === 'publish') {
      // a message to just publish immediately, don't create a data point
      mqttServer.publish({
        topic: packet.topic.split('/')[1],
        payload: packet.payload.toString(),
        qos: 0,
        retain: false,
      });
      return;
    }
    const sinkTitle = packet.topic.split('/')[2];
    const writeKey = packet.topic.split('/')[1];
    const value = packet.payload.toString();
    fetch(`${baseUrl}/d/w/${writeKey}/${sinkTitle}`, { headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }, method: 'POST', body: `mqtt=true&val=${value}`})
      .then(r => {
        console.log(r.status);
      })
      .catch(console.log);

  });
};
module.exports = createMqttStuff;
