<template>
  <div class="container">
    <nuxt />
    <my-footer />
    <div :class="getClass">{{text}}</div>
  </div>
</template>

<script>
import MyFooter from '~/components/Footer.vue';

export default {
  components: {
    MyFooter,
  },
  data() {
    return {
      shown: false,
      type: null,
      text: '',
      timeout: null,
    };
  },
  watch: {
    alerts(val, oldVal) {
      if (!val || val.length === 0) {
        this.shown = false;
        this.text = '';
        this.type = null;
        return;
      }
      if (this.timeout) clearTimeout(this.timeout);
      this.shown = true;
      this.text = val[0].msg;
      this.type = val[0].type;
      this.timeout = setTimeout(() => {
        this.$store.commit('removeAlert');
      }, 2000);
    },
  },
  computed: {
    alerts() {
      return this.$store.state.alerts;
    },
    getClass() {
      if (this.shown) {
        return 'message ' + this.type;
      } else {
        return 'message invisible';
      }
    },
  },
  mounted() {
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
.message {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: all 0.4s ease;
  font-weight: 600;
  line-height: 3.2rem;
}
.success {
  background-color: #76a96b;
  max-height: 3.2rem;
  opacity: 1;
}
.error {
  background-color: #bb5252;
  max-height: 3.2rem;
  opacity: 1;
}
.info {
  background-color: $background-color;
  max-height: 3.2rem;
  opacity: 1;
}
.invisible {
  max-height:0;
  opacity: 0;
}
</style>
