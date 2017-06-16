<template>
  <section class="container">
    <my-header :username="null"/>
    <h1 class="title">
      Sign Up
    </h1>
    <div class="form-container">
      <form action="/auth/signup" method="post">
        <div style="width: 50%; position: relative; display: inline-block; text-align: right; padding-right: 0.5rem;">
          <div>Email Address: </div>
          <div>Password:</div>
        </div>
        <div style="width: 50%; position: relative; display: inline-block; text-align: left; padding-left: 0.5rem;">
          <input type="text" name="email" />
          <input type="password" name="password" />
        </div>
        <input type="submit" value="Submit">
      </form>
    </div>
  </section>
</template>

<script>
import MyHeader from '~components/Header.vue';

import { title } from '~components/config/config';
import axios from '~plugins/axios';

export default {
  name: 'signup',
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

<style lang="scss" scoped>
@import "../assets/css/main.scss";
.title
{
  margin: 30px 0;
}
.form-container {
  border: 1px solid $border-color;
  display: inline-block;
  width: 33vw;
  max-width: 26rem;
  line-height: 4rem;
}
input[type="text"], input[type="password"] {
  max-width: 90%;
}
input[type="submit"] {
  border-radius: 4px;
  background-color: $button-color;
}
</style>
