<template>
  <section class="container">
    <my-header :username="null"/>
    <h1 class="title">
      Sign Up <span class="sub-text">(or <router-link to="/login">log in</router-link>)</span>
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
import MyHeader from '~/components/Header.vue';

import { title } from '~/components/config/config';
import axios from '~/plugins/axios';

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
    return {
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
.title
{
  margin: 30px 0;
}
.form-container {
  border: 1px solid $border-color;
  display: inline-block;
  width: auto;
  max-width: 50vw;
  line-height: 4rem;
}
input[type="text"], input[type="password"] {
  max-width: 90%;
}
input[type="submit"] {
  border-radius: 4px;
  background-color: $button-color;
}
.sub-text {
  font-size: 1rem;
  a {
    text-decoration: underline;
    color: gray;
  }
}
</style>
