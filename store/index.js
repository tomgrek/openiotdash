'use strict';

export const state = () => ({
  authUser: null,
  dashboards: null,
  datasinks: null,
  devices: null,
  selectedDashboard: null,
  alerts: [],
});

export const mutations = {
  weAreMobile: (state, areWe) => {
    state.weAreMobile = areWe;
  },
  setUsername: (state, username) => {
    state.authUser = username;
  },
  setDashboards: (state, dashboards) => {
    state.dashboards = dashboards;
  },
  addDashboard: (state, dashboard) => {
    state.dashboards.push(dashboard);
  },
  renameDashboard: (state, {id, newTitle}) => {
    state.dashboards.filter(x => x.id === id)[0].title = newTitle;
  },
  setColorSchemeOfDashboard: (state, {id, newScheme, setScheme}) => {
    newScheme = newScheme.toLowerCase();
    state.dashboards.filter(x => x.id === id)[0].scheme = newScheme;
    setScheme(newScheme);
  },
  deleteDashboard: (state, id) => {
    state.dashboards = state.dashboards.filter(x => x.id != id);
  },
  setSelectedDashboard: (state, dashboard) => {
    state.selectedDashboard = dashboard;
  },
  deleteDatasink: (state, id) => {
    state.datasinks = state.datasinks.filter(x => x.id != id); // TODO WHY NOT TYPESAFE CHECKING?
  },
  addNewDatasink: (state, datasink) => {
    state.datasinks.push(datasink);
  },
  renameDatasink: (state, {datasinkId, title}) => {
    state.datasinks.filter(x => x.id == datasinkId)[0].title = title;
  },
  deleteDevice: (state, id) => {
    state.devices = state.devices.filter(x => x.id !== id);
  },
  addDevice: (state, device) => {
    state.devices.push(device);
  },
  toggleSinkVisibility: (state, datasinkId) => {
    let sink = state.datasinks.filter(x => x.id == datasinkId)[0];
    sink.visibility = 1 - sink.visibility;
  },
  saveSinkCode: (state, {datasinkId, code}) => {
    state.datasinks.filter(x => x.id == datasinkId)[0].definition = code;
  },
  saveSinkSchema: (state, {datasinkId, schema}) => {
    state.datasinks.filter(x => x.id == datasinkId)[0].schema = schema;
  },
  clearAll: (state) => {
    // For logout
    state.authUser = null;
    state.dashboards = null;
  },
  addAlert(state, alert) {
    state.alerts.push(alert);
  },
  removeAlert(state) {
    state.alerts.shift();
  },
};
