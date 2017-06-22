<template>
  <header>
    <nuxt-link to="/"><span class="header-text">{{headerOptions.headerText}}
    </span></nuxt-link>
    <span v-if="extended" class="extended-header">{{extended}}</span>
    <span v-on:click="profileShowing = !profileShowing" class="header-userbutton" v-if="loggedIn && headerOptions.displayUsername">
      {{username}}
      <ul v-on:mouseout="profileShowing = false" v-show="profileShowing">
        <nuxt-link to="/logout"><li>Logout</li></nuxt-link>
      </ul>
    </span>
  </header>
</template>

<script>
import { headerOptions } from "~components/config/config";

export default {
  name: 'header',
  data() {
    return {
      headerOptions,
      profileShowing: false,
    };
  },
  props: ['username', 'extended'],
  computed: {
    loggedIn() {
      return !!this.$props.username;
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
@import "~assets/css/main.scss";

header {
  position: fixed;
  top: 0;
  display: inline-block;
  width: 100vw;
  border-bottom: 1px solid $border-color;
  left: 0;
  text-align: left;
  padding: 1rem;
  position: relative;
  .header-text {
    left: 0;
  }
  .header-userbutton {
    position: absolute;
    right: 1rem;
    font-size: $smaller-font;
    border: 1px solid $border-color;
    padding: 0.4rem;
    transform: translateY(-0.3rem);
    background-color: white;
    cursor: pointer;
  }
  .header-userbutton:hover {
    filter: brightness(0.9);
  }
  ul {
    list-style: none;
    text-decoration: underline;
  }
  .extended-header {
    padding-left: 2rem;
    font-size: 0.9rem;
    color: $light-text;
  }
}
</style>
