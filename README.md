# Open IoT Dashboard

> An open source, self hosted IoT dashboard

## Build Setup

``` bash
# install dependencies
$ npm install
$ brew install zmq (or as necessary for ZeroMQ on your platform)

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm start
```
## Things to do next:

* Add the data for a component to the execution context of the component's offlineCode. Should be able to do console.log(this.dataSinks['j4xpli'].data)
inside the offlineCode. (Needed because we want to be able to do offline fetch's and then store the results, also do actions based on the results)

* Add datasink from external url (e.g. alpha vantage)
^^ probably taken care of by just defining offlineCode for a component, letting that fetch the data
^^^^ actually not quite true, we don't always want to save data. dataSources should be a thing, even with offline code now,
that just fetches data from a URL when the component is actually displayed.

* add, in settings, ability to directly edit the whole code of the component

* add permissions for other users to edit dashboards owned by a user

* change logo/favicon/404

* make dashboard display linearly on mobile

* add ability to set how often the offlineCode runs

* add (couchDB & postgres) connector, then use pm2 (pm2 start build/main.js -i 0 --name "openiotproject")
