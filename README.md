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

## Things to do next:

* Check MQTT broker still fully functional end-to-end with new settings.

* Add connector for MQTT to use Kafka backend

* Add the data for a component to the execution context of the component's offlineCode. Should be able to do console.log(this.dataSinks['j4xpli'].data)
inside the offlineCode. (Needed because we want to be able to do offline fetch's and then store the results, also do actions based on the results)

* add, in settings, ability to directly edit the whole code of the component

* add permissions for other users to edit dashboards owned by a user

* add ability to set how often the offlineCode runs

* add (couchDB & postgres) connector, then use pm2 (pm2 start build/main.js -i 0 --name "openiotproject")

* TODO: Next: Line 228, modal_settings -> ensure borken urls don't bork the app by wrapping the fetch in promisewrapper. Need to return (resolve)
some kind of error in the promise wrapper though, otherwise, fetchNewData doesn't know that something borked and will overwrite the component's
valid data with crap data.

* Fix issue with map missing after saving dashboard

* Perfect canvas Bubbles

* Perfect sparkline component

* Add proper charting component

* Add proper preview imagery to all components
