'use strict';

import { baseUrl } from '../components/config/config';
import { Dashboard, Datapoint } from '../models';

import fetch from 'node-fetch';

const vm = require('vm');
const cluster = require('cluster');

// TODO: Need to make this threadsafe, ie these in-memory objects won't do for concurrency
let offlineScriptContexts = {};
let parsedDashboards = {};
let runningScripts = {};

const getDataForComponent = sinkList => {
  return new Promise((resolve, reject) => {
    let queries = [];
    for (let sink of sinkList) {
      queries.push(
        Datapoint.findAll({
          attributes: [
              'data',
              'createdAt',
            ],
          where: {
            datasink: sink.id,
          },
          limit: sink.limit,
          order: [sink.orderBy.split(' ')],
        })
      );
    }
    Promise.all(queries).then(d => {
      resolve(d.map((x,i) => {
        return {
          sink: sinkList[i].title,
          readKey: sinkList[i].readKey,
          data: x.map(y => {
            return {
              value: y.data,
              createdAt: y.createdAt,
            };
          }),
        };
      }));
    });
  });
}

// TODO: if script is dead, update its data

const doOffline = () => {
  setInterval(() => {
    Dashboard.findAll().then(d => {
      for (let dash of d) {
        if (!parsedDashboards[dash.id]) parsedDashboards[dash.id] = JSON.parse(dash.definition);
        if (!parsedDashboards[dash.id].components) continue;
        for (let component of parsedDashboards[dash.id].components) {
          // TODO: extend each of the component datasinks with their read/write keys
          if (component.component.offlineCode) {
            // TODO: Need to check for calling code's ownership of dataSink and related dataPoints?
            getDataForComponent(component.component.dataSinks).then(data => {
              // TODO: dont pass in console to the context, once debugging complete
              if (!offlineScriptContexts[component.component.uuid]) {
                offlineScriptContexts[component.component.uuid] = new vm.createContext({fetch, component, setInterval, console, data});
              } else {
                Object.assign(offlineScriptContexts[component.component.uuid], { data });
              }
              if (!runningScripts[component.component.uuid]) {
                runningScripts[component.component.uuid] = new vm.Script(component.component.offlineCode).runInContext(offlineScriptContexts[component.component.uuid]);
              }
            });
          }
        }
      }
    });
  }, 10000);
};

module.exports = {
  doOffline,
  offlineScriptContexts,
  parsedDashboards,
  runningScripts,
  stopScript: id => {
    if (runningScripts[id]) {
      runningScripts[id].close();
    }
    delete runningScripts[id];
  },
};
