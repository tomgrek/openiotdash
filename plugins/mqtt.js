'use strict';

import { baseUrl } from '../components/config/config';

// eg mqtt pub -t 'write/c2928b4027d2e4/j4xbpkli' -h 'localhost' -p 1883 -m '{"value":"30"}'

const fetch = require('node-fetch');
const mosca = require('mosca');

let createMqttStuff = (server) => {
  // let moscaSettings = {
  //   type: 'redis',
  //   redis: require('redis'),
  //   db: 0,
  //   port: 6379,
  //   return_buffers: true,
  //   host: 'localhost'
  // };
  let moscaSettings = {
    type: 'kafka',
    kafka: require('kafka-node'),
    connectionString: 'localhost:2181',
    json: true,
    clientId: 'openioproject',
    groupId: 'openiotproject',
    defaultEncoding: 'utf8',
  };
  const mqttServer = new mosca.Server({
    host: 'localhost',
    port: 1883,
    backend: moscaSettings,
    persistence: { factory: mosca.persistence.Redis },
    id: 'openiotproject',
    publishNewClient: false,
    publishClientDisconnect: false,
    publishSubscriptions: false,
  });
  mqttServer.attachHttpServer(server);

  var kafka = require('kafka-node');
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.Client;
let topic = 'test';//as
var client = new Client('localhost:2181');
var topics = [
    {topic: topic}
];
var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);

consumer.on('message', function (message) {
  console.log(message);
});


  mqttServer.on('published', function(packet, client) {
    console.log(packet);//
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
    fetch(`${baseUrl}/d/w/${writeKey}/${sinkTitle}`, { headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }, method: 'POST', body: `mqtt=true&val=${encodeURIComponent(value)}`})
      .then(r => {
        console.log(r.status);
      })
      .catch(console.log);

  });
};
module.exports = createMqttStuff;
