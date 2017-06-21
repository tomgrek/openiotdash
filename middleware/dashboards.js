import axios from '~plugins/axios';

// With current version of Nuxt asyncData isn't called on navigating back after a reload.
export default async function (context) {
  if (context.isServer) {
    let dashboards = await axios.get('/data/dashboards/' + context.req.user.id);
    context.dashboards = dashboards.data;
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
