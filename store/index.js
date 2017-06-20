export const state = () => ({
  authUser: null,
  dashboards: null,
  selectedDashboard: null,
});

export const mutations = {
  setUsername: (state, username) => {
    state.authUser = username;
  },
  setDashboards: (state, dashboards) => {
    state.dashboards = dashboards;
  },
  setSelectedDashboard: (state, dashboard) => {
    state.selectedDashboard = dashboard;
  },
  clearAll: (state) => {
    // For logout
    state.authUser = null;
    state.dashboards = null;
  },
};
