'use strict';

import { baseUrl, messageQueueBackend, messageQueueHost, messageQueuePort } from '../components/config/config';

// eg mqtt pub -t 'write/c2928b4027d2e4/j4xbpkli' -h 'localhost' -p 1883 -m '{"value":"30"}'

const fetch = require('node-fetch');
const mosca = require('mosca');

let mqttServer;

let publishToMQTT = thing => {
  if (!thing.qos) thing.qos = 0;
  if (!thing.retain) thing.retain = false;
  mqttServer.publish(thing);
};

let createMqttStuff = (server) => {
  switch(messageQueueBackend) {
    case 'redis': {
      let moscaBackend = {
        type: 'redis',
        redis: require('redis'),
        db: 0,
        port: messageQueuePort,
        return_buffers: true,
        host: messageQueueHost,
      };
      mqttServer = new mosca.Server({ host: 'localhost', port: 1883, backend: moscaBackend, persistence: { factory: mosca.persistence.Redis } });
      break;
    }
    case 'kafka': {
      let moscaBackend = {
        type: 'kafka',
        kafka: require('kafka-node'),
        connectionString: messageQueueHost + ':' + messageQueuePort,
        clientId: 'openiotproject',
        groupId: 'openiotproject',
        defaultEncoding: 'utf8',
      };
      mqttServer = new mosca.Server({
        host: 'localhost',
        port: 1883,
        backend: moscaBackend,
        id: 'openiotproject',
        publishNewClient: false,
        publishClientDisconnect: false,
        publishSubscriptions: false,
      });
      break;
    }
    default: {
      mqttServer = new mosca.Server({ host: 'localhost', port: 1883 });
      break;
    }
  }
  mqttServer.attachHttpServer(server);

  mqttServer.on('published', function(packet, client) {
    console.log(packet);//
    if (packet.qos === undefined) return false; // it's a client connect/disconnect msg
    const command = packet.topic.split('/')[0];
    if (command === 'publish') {
      // a message to just publish immediately, don't create a data point
      publishToMQTT({
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
    fetch(`${baseUrl}/d/w/${writeKey}/${sinkTitle}`, { headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }, method: 'POST', body: `mqtt=true&val=${encodeURIComponent(value)}`})
      .catch(console.log);

  });
};
module.exports = {
  createMqttStuff,
  publishToMQTT,
};
