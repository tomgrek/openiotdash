import axios from '~/plugins/axios';

export default async function (context) {
  if (context.isServer) {
    let devices = await axios.get('/data/devices/' + context.req.user.id);
    context.devices = devices.data;
    if (context.store && context.store.state) {
      context.store.state.devices = context.devices;
    }
  } else {
    if (context.store && context.store.state && context.store.state.devices) {
      context.devices = context.store.state.devices;
    } else {
      return context.redirect('/login');
    }
  }
}
