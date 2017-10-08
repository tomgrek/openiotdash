import { baseUrl, messageQueueHost, messageQueuePort, kafka as kafkaConfig } from '../components/config/config';

import { Datasink } from '../models';
import { publishToMQTT } from './mqtt';
import fetch from 'node-fetch';

// Topics subscribed to should already be created ideally with a number of partitions equal to the number of cluster nodes
// e.g. bin/kafka-topics.sh --zookeeper localhost:2181 --create --topic test --replication-factor 1 --partitions 2
// the messages are then distributed by Kafka amongst those nodes. If topic only has 1 partition, its messages
// will always go to the same node.
// can test from console like this: bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test --property parse.key=true --property key.separator=,
// then send some messages with different keys e.g. a,OH b,HECK, a,SNEK --> a's might all go to 2999, and b's might all go to 3000
// more partitions than consumers/cluster nodes is OK.

const kafka = require('kafka-node');
const ConsumerGroup = kafka.ConsumerGroup;
const options = {
  autoCommit: true,
  groupId: 'openiotproject',
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024,
  host: messageQueueHost + ':' + messageQueuePort, // should be a zookeeper instance
  protocol: ['roundrobin'],
  fromOffset: 'latest',
};

// kafka to mqtt bridge
const bridge = new ConsumerGroup(options, kafkaConfig.kafkaToMQTTTopics);
bridge.on('message', (message) => {
  publishToMQTT({
    topic: message.topic,
    payload: message.value.toString(),
    qos: 0,
    retain: false,
  });
});

let consumer;

const messageReceived = (message) => {
  console.log(message);
  // if topic[0] = 'write' and topic[1] = the correct write key and topic[2] = the sink id, then fetch(/d/w/....) with message.value
  let parts = message.topic.split('_'); // cant use / in kafka, replace with _
  if (parts[0] === 'write') {
    fetch(`${baseUrl}/d/w/${parts[1]}/${parts[2]}`, { headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }, method: 'POST', body: `mqtt=true&val=${encodeURIComponent(message.value)}`})
      .catch(console.log);
  }
};

Datasink.findAll({}).then(sinks => {
  let kafkaTopics = [];
  for (let sink of sinks) {
    kafkaTopics.push(`write_${sink.writeKey}_${sink.title}`);
  }
  consumer = new ConsumerGroup(options, kafkaTopics);
  consumer.on('message', messageReceived);

});

export function removeTopic(writeKey, title) {
  let topics = consumer.topics.filter(x => x !== `write_${writeKey}_${title}`);
  consumer.close(true, () => {
    consumer = new ConsumerGroup(options, topics);
    consumer.on('message', messageReceived);
  });
};

export function addTopic(writeKey, title) {
  let topics = consumer.topics.concat(`write_${writeKey}_${title}`);

  consumer.client.createTopics([`write_${writeKey}_${title}`], false, () => {
    consumer.close(true, () => {
      consumer = new ConsumerGroup(options, topics);
      consumer.on('message', messageReceived);
    });
  });

  // Tried to do it this way via addTopic, but that seems buggy in the node-kafka library; it also requires that topic already exists
  // for now, because adding sinks is will not happen that often relatively, just recreate the consumer. Not ideal but..
  // let tempClient = new kafka.Client(messageQueueHost + ':' + messageQueuePort, 'openiotprojecttemp');
  // tempClient.on('ready', () => {
  //   let producer = new kafka.HighLevelProducer(tempClient);
  //   producer.on('ready', (err, data) => {
  //     producer.createTopics([`write_${writeKey}_${title}`], true, (err,data) => {
  //       // producer.send([{topic: [`write_${writeKey}_${title}`], message: ['start']}], (err, data) => {
  //         setTimeout(() => { consumer.addTopics([`write_${writeKey}_${title}`], (err, data) => {
  //           //setTimeout(() => tempClient.close(console.log), 1000);
  //         }); }, 1000);
  //       //});
  //     });
  //   });
  // });
};
