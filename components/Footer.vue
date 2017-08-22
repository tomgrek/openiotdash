<template>
  <footer>
    Powered by <img src="~assets/img/logo.png" class="tiny-logo" />Open IoT Dash
  </footer>
</template>

<style lang="scss" scoped>
@import "~assets/css/main.scss";
footer {
  position: fixed;
  left: 0;
  bottom: 0;
  display: inline-block;
  width: 100vw;
  height: 3.2rem;
  line-height: 3.2rem;
  text-align: center;
  border-top: 1px solid $border-color;
  font-family: 'Roboto Slab', serif;
  .tiny-logo {
    display: inline-block;
    position: relative;
    top: 0.1rem;
    width: 1.5rem;
    margin: 0 0.5rem;
  }
  @include phone {
    display: none;
  }
}
</style>
