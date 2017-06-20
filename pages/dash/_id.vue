<template>
  <section class="container">
    <my-header :username="username"/>
    <h1 class="title">{{this.$router.currentRoute.params.id}}
      {{dashboard.title}}
    </h1>
  </section>
</template>

<script>
import { title, indexOptions } from "~components/config/config";

import axios from '~plugins/axios';
import MyHeader from '~components/Header.vue';

export default {
  name: 'dash',
  middleware: ['authentication', 'dashboards'],
  components: {
    MyHeader,
  },
  data() {
    return {
      indexOptions,
    };
  },
  computed: {
    username() {
      return this.$store.state.authUser;
    },
  },
  async asyncData(context) {
    let dashboard = await axios.get(`/data/dashboard/${context.params.id}`);
    context.store.commit('setSelectedDashboard', dashboard.data);
    return {
       dashboard: dashboard.data,
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
@import "../../assets/css/main.scss";

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
