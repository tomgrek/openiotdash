<template>
  <section class="container">
    <my-header :username="username"/>
    <h1 class="title">
      {{indexOptions.title}}
    </h1>
    <div class="links-container">
      <div><nuxt-link v-if="username === null" to="/login">Log In</nuxt-link></div>
      <div><nuxt-link v-if="username === null" to="/signup">Create An Account</nuxt-link></div>
    </div>
  </section>
</template>

<script>
import { title, indexOptions } from "~components/config/config";

import axios from '~plugins/axios';
import MyHeader from '~components/Header.vue';

export default {
  name: 'index',
  components: {
    MyHeader,
  },
  data() {
    return {
      indexOptions,
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
  },
}
</script>

<style lang="scss" scoped>
@import "../assets/css/main.scss";

.title {
  margin: 30px 0;
  color: $primary-text;
}
.links-container {
  border: 1px solid $border-color;
  display: inline-block;
  width: 33%;
  line-height: 4rem;
  text-decoration: underline;
}
</style>
