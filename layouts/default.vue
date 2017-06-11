<template>
  <div class="container">
    <nuxt />
    <my-footer />
  </div>
</template>

<script>
import MyFooter from '~components/Footer.vue';

export default {
  components: {
    MyFooter,
  },
}
</script>

<style lang="scss" scoped>
@import "~assets/css/main.scss";

.container
{
  margin: 0;
  width: 100vw;
  height: 100vh;
  top: 0;
  text-align: center;
  background-color: $background-color;
}
</style>
