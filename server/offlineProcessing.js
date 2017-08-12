'use strict';

import { baseUrl } from '../components/config/config';
import { Dashboard } from '../models';

import fetch from 'node-fetch';

const vm = require('vm');

let offlineScriptContexts = {};
let parsedDashboards = {};

// TODO: need to populate the component's data before passing it in to the context.
// and ensure that is updated as new data comes in (can update a variable outside of sandbox)

const doOffline = () => {
  setInterval(() => {
    Dashboard.findAll().then(d => {
      for (let dash of d) {
        if (!parsedDashboards[dash.id]) parsedDashboards[dash.id] = JSON.parse(dash.definition);
        if (!parsedDashboards[dash.id].components) continue;
        for (let component of parsedDashboards[dash.id].components) {
          if (component.component.offlineCode) {
            if (!offlineScriptContexts[component.component.uuid]) {
              offlineScriptContexts[component.component.uuid] = new vm.createContext({fetch, component, setInterval, console});
              new vm.Script(component.component.offlineCode).runInContext(offlineScriptContexts[component.component.uuid]);
            }
          }
        }
      }
    });
  }, 10000);
};
module.exports = doOffline;
