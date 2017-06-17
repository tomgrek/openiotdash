<template>
  <section class="container">
    <my-header :username="username"/>
    <h1 class="title">
      {{indexOptions.title}}
    </h1>
    <div class="links-container">
      <div v-if="username !== null">
        <div class="dashboards-header">
          <span class="dashboards-title">My Dashboards</span>
          <button class="small-button new-button">New</button>
          <button class="small-button delete-button">Delete</button>
        </div>
        <div class="dashboards-list">
          <ul>
            <li v-for="dashboard in dashboards" class="dashboards-list-item">
              <input type="checkbox"></input>
              {{dashboard}}
            </li>
          </ul>
        </div>
      </div>
      </div>
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
      let username = (() => {
        if (context.req && context.req.user && context.req.user.username) {
          return context.req.user.username;
        }
        return null;
      })();
      let { data } = await axios.get('/api/dashboards'); //: 'tom',// await axios.get('/api/dashboards'),
      return {
        username,
        dashboards: data,
      };
    //};
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
  nuxt-link {
    text-decoration: underline;
  }
}
.dashboards-header {
  background-color: $background-dark;
  text-align: left;
  padding: 0 1rem;
  position: relative;
  .dashboards-title {
    font-weight: 900;
  }
  .new-button {
    position: absolute;
    right: 1rem;
    top: 1.1rem;
  }
  .delete-button {
    position: absolute;
    right: 5rem;
    top: 1.1rem;
  }
}
.dashboards-list {
  position: relative;
  line-height: 2rem;
  li {
    list-style: none;
  }
  input[type="checkbox"] {
    position: absolute;
    left: -1.4rem;
    top: 0.5rem;
  }
  .dashboards-list-item {
    text-align: left;
    padding: 0 1rem;
    position: relative;
  }
}
</style>
