<template>
  <section class="container">
    <my-header :username="username"/>
    <h1 class="title">
      Use {{zig}}
    </h1>
  </section>
</template>

<script>

import { title } from '~components/config/config';

import axios from '~plugins/axios';
import MyHeader from '~components/Header.vue';

export default {
  name: 'index',
  components: {
    MyHeader,
  },
  data() {
    return {
      zig: 'false',
    };
  },
  async asyncData(context) {
    // let {username} = await axios.get('/user');
    return {
      username: (() => {
        if (context.req && context.req.user && context.req.user.username) {
          return context.req.user.username;
        }
        return null
      })(),
    };
  },
  head() {
    return {
      title,
    };
  },
  mounted() {
    //console.log('mounted', this.$store.state, this.request);
    // setTimeout(() => fetch('/zig', {credentials: 'include'}).then(res => res.json()).then(z => this.zig = z.yay), 2000);
  },
}
</script>

<style lang="scss" scoped>
@import "../assets/css/main.scss";

.title
{
  margin: 30px 0;
  color: $primary-text;
}
.users
{
  list-style: none;
  margin: 0;
  padding: 0;
}
.user
{
  margin: 10px 0;
}
</style>
