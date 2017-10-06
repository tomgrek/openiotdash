# Open IoT Dashboard

> An open source, self hosted IoT dashboard

## Build Setup

``` bash
# install dependencies
$ npm install
$ brew install zmq (or as necessary for ZeroMQ on your platform)
$ brew install redis / brew services start redis (or as necessary for Redis on your platform -- or point it elsewhere)

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm start
```

## nginx configuration for clusters:

Load balancing between 2 nodes, but socketio still works:

```
upstream io_nodes {
  ip_hash;
  server 127.0.0.1:2999;
  server 127.0.0.1:3000;
}
server {
  listen 3001;
  server_name localhost;
  location / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_pass http://io_nodes;
  }
}
```

## To start Kafka:

If you want to use it and don't have an existing endpoint.

```
bin/zookeeper-server-start.sh config/zookeeper.properties
bin/kafka-server-start.sh config/server.properties

maybe edit server.properties and add:
auto.create.topics.enable=true

```

## Things to do next:

* user should be able to delete datasinks (not per-component, but on a global basis to them) (...and update kafka topics)

* optional schema validation on datasink write

* in offline code and code that runs on sink write, stats should be available to the component's code (for stream analytics/anomaly detection). Mean, std, min/max.
Store these in redis and update them (there's a stream algorithm for std) on writes.

* user should be able to rename datasinks

* inconsistency between datasink write endpoints -- d/w/writekey/id? or d/w/writekey/[uuid/title]?? Be wary of this, but I've standardized
on titles instead of id's, and fixed the discrepancy with d/w and d/r. Ensure it's not possible to create two datasinks -- or rename
one of them -- to be the same as an existing datasink.

* add, in settings, ability to directly edit the whole code of the component

* add permissions for other users to edit dashboards owned by a user

* TODO: Next: Line 228, modal_settings -> ensure borken urls don't bork the app by wrapping the fetch in promisewrapper. Need to return (resolve)
some kind of error in the promise wrapper though, otherwise, fetchNewData doesn't know that something borked and will overwrite the component's
valid data with crap data.

* Fix issue with map missing after saving dashboard

* Perfect canvas Bubbles

* Perfect sparkline component

* Add proper charting component

* Add proper preview imagery to all components

## Components to make:

* Color picker

* Configurable buttons component - thru settings can add different buttons that trigger different endpoints (will this require a kind
  of templating language for components? Hope not)

## HOWTO publish a datapoint

Can put the write key into the url for very simple devices; if you set headers though try the second one (it keeps the token/writekey
secret, because while third parties can read a URL, they can't read a header.

```
curl http://localhost:3000/d/w/1598ebb72d78a3/j75a8bzc -X "POST" -v -d "lng=-122.5&lat=37.1&val=107"

curl http://localhost:3000/d/w/PRIVATE/j75a8bzc -X "POST" -v -d "lng=-122.5&lat=37.1&val=109" -H "Authorization: Bearer 1598ebsdfsdf"
```

(Also, MQTT and Kafka work, but see their separate sections)

## HOWTO read data points


## HOWTO publish a message through Kafka

```
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic "write_[writekey]_[sinkname]" --property parse.key=true --property key.separator=,
```
then in the REPL

use any random key comma value e.g.

oitd,{"value":10}

```
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic "write_1598ebb72d78a3_j75a8bzc" --property parse.key=true --property key.separator=,
```

>asd,lng=-122.5&lat=37.1&val=222

## Use this as a Kafka-to-MQTT bridge

Messages published through Kafka to any topic in the list kafkaToMQTTTopics will be brokered to MQTT.

Check this with: ```mqtt subscribe -h localhost -p 1883 -t "MYTOPIC"```

## HOWTO: MQTT

To publish - for the map component, for example:

```
mqtt pub -t 'write/1598ebb72d78a3/j75a8bzc' -h 'localhost' -p 1883 -m 'lng=-122.5&lat=37.1&val=120'
```

To use OITD dash just as a MQTT broker that receives messages and publishes them for use elsewhere, replace write above with publish.
Publishing a message doesn't create any data point or any UI changes (no websocket message is published, e.g.):

```
mqtt pub -t 'publish/MYTOPIC' -h 'localhost' -p 1883 -m 'SOME MESSAGE'

To subscribe, from the command line:

```
mqtt subscribe -h localhost -p 1883 -t "MYTOPIC"
```
