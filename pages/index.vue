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
          <button class="small-button new-button" v-on:click="newDashboard">New</button>
          <button class="small-button delete-button" v-on:click="deleteDashboard">Delete</button>
        </div>
        <div class="dashboards-list">
          <ul>
            <li v-for="dashboard, i in dashboards" class="dashboards-list-item">
              <input type="checkbox" v-model="listOfCheckboxes[i]"></input>
              <nuxt-link :to="`/dash/${dashboard.id}`">{{dashboard.title}}</nuxt-link>
            </li>
          </ul>
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
  middleware: ['authentication', 'dashboards'],
  components: {
    MyHeader,
  },
  data() {
    return {
      listOfCheckboxes: [],
      indexOptions,
    };
  },
  async asyncData(context) {
    return {
      username: context.username,
    }
  },
  head() {
    return {
      title,
    };
  },
  computed: {
    dashboards() {
      return this.$store.state.dashboards;
    },
  },
  watch: {
    dashboards(val) {
      this.listOfCheckboxes = val.map(x => false);
    },
  },
  mounted() {
    this.listOfCheckboxes = this.dashboards.map(x => false);
  },
  methods: {
    newDashboard(e) {
      fetch('/api/dashboards/new', {credentials: 'include'}).then(r => r.json())
        .then(res => {
          this.$store.commit('addAlert', { msg: 'New dashboard successfully created', type: 'success'});
          this.$store.commit('addDashboard', res);
        });
    },
    deleteDashboard(e) {
      let toDelete = this.listOfCheckboxes.reduce((acc, x, i) => {
        if (x) {
          acc.push(this.dashboards[i].id);
        }
        return acc;
      }, []);
      let qs = '';
      for (let item of toDelete) {
        qs = qs + `id=${item}&`;
      }
      fetch(`/api/dashboards/delete?${qs}`, {credentials: 'include'})
      .then(res => {
        for (let dash of toDelete) {
          this.$store.commit('deleteDashboard', dash);
        }
        this.$store.commit('addAlert', { msg: 'Dashboard(s) deleted', type: 'success'});
      });
    },
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
