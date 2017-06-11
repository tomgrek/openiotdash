<template>
  <section class="container">
    <my-header :username="null"/>
    <h1 class="title">
      Sign Up
    </h1>
    <form action="/auth/signup" method="post">
      <div>
        <span>Email Address: </span>
        <input type="text" name="email" />
      </div>
      <div>
        <span>Password:</span>
        <input type="text" name="password" />
      </div>
      <input type="submit" value="Submit">
    </form>
  </section>
</template>

<script>
import MyHeader from '~components/Header.vue';

import { title } from '~components/config/config';
import axios from '~plugins/axios';

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
  async asyncData() {
    //let { data } = await axios.get('/zig');
    return {
    };
  },
  head() {
    return {
      title,
    };
  },
  mounted() {
    //setTimeout(() => fetch('/zig', {credentials: 'include'}).then(res => res.json()).then(z => this.zig = z.yay), 2000);
  },
}
</script>

<style scoped>
.title
{
  margin: 30px 0;
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
