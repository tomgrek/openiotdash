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

* add, in settings, ability to directly edit the whole code of the component

* add permissions for other users to edit dashboards owned by a user

* add ability to set how often the offlineCode runs

* add (couchDB & postgres) connector, then use pm2 (pm2 start build/main.js -i 0 --name "openiotproject")

* TODO: Next: Line 228, modal_settings -> ensure borken urls don't bork the app by wrapping the fetch in promisewrapper. Need to return (resolve)
some kind of error in the promise wrapper though, otherwise, fetchNewData doesn't know that something borked and will overwrite the component's
valid data with crap data.

* Fix issue with map missing after saving dashboard

* TODO: Next: Bubbles in canvas ala https://codepen.io/MarioD/pen/gWregQ
