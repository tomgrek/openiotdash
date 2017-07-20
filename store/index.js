'use strict';

export const state = () => ({
  authUser: null,
  dashboards: null,
  selectedDashboard: null,
  alerts: [],
});

export const mutations = {
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
  deleteDashboard: (state, id) => {
    state.dashboards = state.dashboards.filter(x => x.id != id);
  },
  setSelectedDashboard: (state, dashboard) => {
    state.selectedDashboard = dashboard;
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
