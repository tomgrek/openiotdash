<template>
  <div>
    Logging out and redirecting you home.
  </div>
</template>

<script>
export default {
  name: 'logout',
  mounted() {
    fetch('/auth/logout', {credentials: 'include'}).then(() => {
      this.$router.replace('/');
      this.$store.commit('clearAll');
    });
  },
}
</script>

<style lang="scss" scoped>
@import "~assets/css/main.scss";

div {
  padding: 2rem;
}
</style>
