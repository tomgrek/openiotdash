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
  host: messageQueueHost + ':' + messageQueuePort,
  protocol: ['roundrobin'],
  fromOffset: 'latest',
};

// TODO: The subscribed kafka topics should update when any user adds/deletes a datasink
Datasink.findAll({}).then(sinks => {
  let kafkaTopics = [];
  for (let sink of sinks) {
    kafkaTopics.push(`publish_${sink.writeKey}_${sink.title}`);
    kafkaTopics.push(`write_${sink.writeKey}_${sink.title}`);
  }
  const consumer = new ConsumerGroup(options, kafkaTopics);

  consumer.on('message', function (message) {
    // TODO : take action ...
    // if topic[0] = 'write' and topic[1] = the correct write key and topic[2] = the sink id, then fetch(/d/w/....) with message.value
    let parts = message.topic.split('_'); // cant use / in kafka, replace with _
    if (parts[0] === 'publish') {
      console.log(parts[1], parts[2], message.value);
    }
    if (parts[0] === 'write') {
      // TODO: currently here, looks like value is not being passed from a kafka console write.
      fetch(`${baseUrl}/d/w/${parts[1]}/${parts[2]}`, { headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }, method: 'POST', body: `mqtt=true&val=${encodeURIComponent(message.value)}`})
        .catch(console.log);
    }
  });
});
