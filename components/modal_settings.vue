<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <span class="close-icon" @click="$emit('close')"><i class="material-icons">close</i></span>
          <div class="modal-header">Settings</div>
          <div class="tabs">
            <div class="tab" data-active @click="makeActive" id="settings_tab">Settings</div>
            <div class="tab" @click="makeActive" id="dataSources_tab">Data Sources</div>
          </div>
          <div v-if="activeComponent === 'settings_tab'">
            <form ref="activeSettings" v-html="component.component.settingsDisplay" />
          </div>
          <div v-if="activeComponent === 'dataSources_tab'">
            <div>Data sources</div>
          </div>
          <div style="position: relative; display: inline-block; margin-top: 0.5rem; width:100%;">
            <button class="small-button" @click="$emit('close')" style="float: right;">Cancel</button>
            <button class="small-button" @click="saveSettings()" style="margin-right: 0.5rem; float:right;">Save</button>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'modal_settings',
  props: ['component'],
  data() {
    return {
      activeComponent: 'settings_tab',
    }
  },
  methods: {
    saveSettings(e) {
      for (let el of this.$refs.activeSettings) {
        if (el.id === 'title') {
          this.$props.component.component.title = el.value;
          this.$props.component.node.querySelector(`#componentTitle-${this.$props.component.uuid}`).innerText = el.value;
        } else {
          this.$props.component.component.settings[el.id] = el.value;
        }
      }
      let settingsEvent = new CustomEvent('settingsChanged');
      this.$props.component.node.dispatchEvent(settingsEvent);
      this.$emit('close');
    },
    makeActive(e) {
      const elements = document.getElementsByClassName('tab');
      for (let tab = 0; tab < elements.length; tab += 1) {
        elements[tab].removeAttribute('data-active');
      };
      e.target.setAttribute('data-active', true);
      this.activeComponent = e.target.id;
    }
  },
  mounted() {
    for (let el of this.$refs.activeSettings) {
      if (el.id === 'title') {
        el.value = this.$props.component.component.title;
      } else {
        el.value = this.$props.component.component.settings[el.id];
      }
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
.tabs {
  white-space: nowrap;
  padding: 1rem 0 0 0;
  border-bottom: 1px solid $border-color;
}
.tab {
  display: inline-block;
  width: 50%;
  color: $light-text;
  font-weight: 500;
  vertical-align: middle;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 4px 4px 0 0;
  border: solid 2px transparent;
  padding: 0 0.5rem;
}
.tab[data-active] {
  border-color: $border-color;
  background: $background-dark;
}

.modal-default-button {
  float: right;
}
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

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
