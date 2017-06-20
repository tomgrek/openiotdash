import axios from '~plugins/axios';

// With current version of Nuxt asyncData isn't called on navigating back after a reload.
export default async function (context) {
  if (context.isServer) {
    context.dashboards = [{id: 1, title: 'dash1'},{id: 2, title: 'dash2'}];
    if (context.store && context.store.state) {
      context.store.state.dashboards = context.dashboards;
    }
  } else {
    if (context.store && context.store.state && context.store.state.dashboards) {
      context.dashboards = context.store.state.dashboards;
    } else {
      return context.redirect('/login');
    }
  }
}
