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
```

## Things to do next:

* TODO: Next: Currently working on this: Kafka consumer should do something useful, ie save the datapoint

* If datasink is added or deleted, kafka topics should update.

* Datapoint on save should also publish to kafka

* POST endpoints should allow the write key to be 'PRIVATE', in which case it's contained in the header as Authorization: Bearer

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

## HOWTO publish a message through Kafka

```
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic "write_[writekey]_[sinkname]" --property parse.key=true --property key.separator=,

then in the REPL

use any random key comma value e.g.

oitd,{"value":10}
