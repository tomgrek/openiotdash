import axios from '~/plugins/axios';

// With current version of Nuxt asyncData isn't called on navigating back after a reload.
export default async function (context) {
  if (context.isServer) {
    if (context.req && context.req.user && context.req.user.username) {
      context.store.state.authUser = context.req.user.username;
      context.username = context.req.user.username;
    } else {
      return context.redirect('/login');
    }
  } else {
    if (context.store && context.store.state && context.store.state.authUser) {
      context.username = context.store.state.authUser;
    } else {
      return context.redirect('/login');
    }
  }
}
