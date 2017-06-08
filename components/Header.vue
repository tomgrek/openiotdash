<template>
  <header>
    <div v-if="loggedIn">Welcome {{username}}</div>
  </header>
</template>

<script>
export default {
  name: 'header',
  data() {
    return {
    };
  },
  props: ['username'],
  computed: {
    loggedIn() {
      return !!this.$props.username;
    },
  },
  mounted() {
    console.log('mon ' + this.$props.username);
  },
};
</script>

<style>
header {
  position: fixed;
  top: 0;
  display: inline-block;
  width: 100vw;
}
</style>
