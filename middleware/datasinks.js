import axios from '~/plugins/axios';

export default async function (context) {
  if (context.isServer) {
    let dashboards = await axios.get('/data/datasinks/' + context.req.user.id);
    context.datasinks = dashboards.data;
    if (context.store && context.store.state) {
      context.store.state.datasinks = context.datasinks;
    }
  } else {
    if (context.store && context.store.state && context.store.state.datasinks) {
      context.datasinks = context.store.state.datasinks;
    } else {
      return context.redirect('/login');
    }
  }
}
