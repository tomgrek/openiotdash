<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <span class="close-icon" @click="$emit('close')"><i class="material-icons">close</i></span>
          <div class="modal-header">Set Visibility</div>

          <div>
            Visibility:
            <select v-model="newVisibility" style="width: 100%;">
              <option>Private (requires read key)</option>
              <option>Open (public can get the read key)</option>
            </select>
          </div>

          <div style="position: relative; display: inline-block; margin-top: 0.5rem; width:100%;">
            <button class="small-button" @click="$emit('close')" style="float: right;">Cancel</button>
            <button class="small-button" @click="save()" style="margin-right: 0.5rem; float:right;">Save</button>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'modal_sinkvisibility',
  props: ['sinks'],
  data() {
    return {
      newVisibility: 0,
      visibilities: ['Private (requires read key)', 'Open (public can get the read key)'],
    }
  },
  methods: {
    save() {
      let queries = [];
      for (let sink of this.$props.sinks) {
        sink.visibility = this.visibilities.indexOf(this.newVisibility);
        const body = JSON.stringify({
          id: sink.id,
          visibility: sink.visibility,
        });
        queries.push(fetch(`/api/datasinks/changeVisibility/`, { credentials: 'include', method: 'POST', body, headers: {'Content-Type': 'application/json'} }));
      }
      Promise.all(queries)
        .then(() => {
          this.$store.commit('addAlert', { msg: 'Visibility of data sinks successfully set.', type: 'success'});
          this.$emit('close');
        })
        .catch(e => {
          this.$store.commit('addAlert', { msg: 'Problem setting visibility: ' + e, type: 'error'});
          this.$emit('close');
        });
    },
  },
  mounted() {
    if (this.$props.sinks.length === 1) {
      this.newVisibility = this.visibilities[this.$props.sinks[0].visibility];
    } else {
      this.newVisibility = this.visibilities[0];
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~assets/css/main.scss";

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.modal-container {
  width: 20rem;
  margin: 0px auto;
  padding: 1rem 1.5rem;
  background-color: #fff;
  border-radius: 2px;
  border: 2px solid black;
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
  text-align: left;
  position: relative;
}
.close-icon {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  color: $icon-base-color;
  cursor: pointer;
}

.modal-header {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: $primary-text;
  font-weight: 600;
}

.modal-body {
  margin: 1rem 0;
}

.modal-default-button {
  float: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
