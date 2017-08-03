<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div v-if="mainWindowVisible" class="modal-container">
          <span class="close-icon" @click="$emit('close')"><i class="material-icons">close</i></span>
          <div class="modal-header">Settings</div>
          <div class="tabs">
            <div class="tab" data-active @click="makeActive" id="settings_tab">Settings</div>
            <div class="tab" @click="makeActive" id="dataSinks_tab">Data Sinks</div>
            <div class="tab" @click="makeActive" id="dataSources_tab">Data Sources</div>
          </div>
          <div v-if="activeComponent === 'settings_tab'">
            <form ref="activeSettings" v-html="component.component.settingsDisplay" />
          </div>
          <div v-if="activeComponent === 'dataSinks_tab'">
            <div class="datasinks-toolbox">
              <input type="checkbox" v-on:change="toggleAllSinks"></input>
              <i v-on:click="deleteDatasink" title="Remove selected data sinks from this component" class="material-icons toolbox-icon">delete</i>
              <i v-on:click="reuseDatasink" title="Add an existing datasink" class="material-icons toolbox-icon">playlist_add</i>
              <i v-on:click="addDatasink" title="Add a brand new data sink" class="material-icons toolbox-icon">add</i>
            </div>
            <div id="sinkContainer" class="datasink-listing" v-for="dataSink in component.component.dataSinks">
              <span>
                <input type="checkbox" v-on:change="toggleSink(dataSink, $event)"></input>
                <span class="listing-title">{{dataSink.title}}</span>
                <span class="listing-url">{{dataSink.url}}</span>
              </span>
            </div>
          </div>
          <div v-if="activeComponent === 'dataSources_tab'">
            <div>Data sources</div>
          </div>
          <div style="position: absolute; bottom: 1rem; right: 1rem; display: inline-block; width:100%;">
            <button class="small-button" @click="$emit('close')" style="float: right;">Cancel</button>
            <button class="small-button" @click="saveSettings()" style="margin-right: 0.5rem; float:right;">Save</button>
          </div>
        </div>
        <ModalDatasinks v-if="reuseDatasinkWindowVisible" @close="dismissReuseDatasinksWindow" :add="addDatasink"/>
      </div>
    </div>
  </transition>
</template>

<script>
import { flashSave } from '~plugins/utils';
import ModalDatasinks from '~components/modal_datasinks';
export default {
  name: 'modal_settings',
  props: ['component'],
  components: {
    ModalDatasinks,
  },
  data() {
    return {
      activeComponent: 'settings_tab',
      selectedSinks: [],
      reuseDatasinkWindowVisible: false,
      mainWindowVisible: true,
    }
  },
  methods: {
    dismissReuseDatasinksWindow() {
      this.reuseDatasinkWindowVisible = false;
      this.mainWindowVisible = true;
      setTimeout(() => this.makeActive(), 0);
    },
    toggleAllSinks(e) {
      if (e.target.checked) {
        this.selectedSinks = [].concat(this.$props.component.component.dataSinks);
        for (let el of document.getElementById('sinkContainer').querySelectorAll('input[type="checkbox"]')) {
          el.checked = true;
        }
      } else {
        this.selectedSinks = [];
        for (let el of document.getElementById('sinkContainer').querySelectorAll('input[type="checkbox"]')) {
          el.checked = false;
        }
      }
    },
    toggleSink(sink, e) {
      if (!e.target.checked && this.selectedSinks.map(x => x.id).includes(sink.id)) {
        this.selectedSinks = this.selectedSinks.filter(x => x.id !== sink.id);
      } else {
        if (e.target.checked) {
          this.selectedSinks.push(sink);
        }
      }
    },
    deleteDatasink() {
      this.$props.component.component.dataSinks = this.$props.component.component.dataSinks.filter(x => !this.selectedSinks.map(y => y.id).includes(x.id));
      for (let sink of this.selectedSinks) {
        this.$props.component.component.data[sink.title] = [];
      }
      let dataEvent = new CustomEvent('data', { detail: {} });
      this.$props.component.node.dispatchEvent(dataEvent);
    },
    reuseDatasink() {
      this.mainWindowVisible = false;
      this.reuseDatasinkWindowVisible = true;
    },
    addDatasink(existingSinks) { // existingSink is optional, coming from the modal_datasinks
      if (existingSinks) {
        for (let sink of existingSinks) {
          this.$props.component.component.dataSinks.push({ id: sink.id, title: sink.title, readKey: sink.readKey, url: 'NEEDTOSET'});
        }
        this.$store.commit('addAlert', { msg: 'Data sinks added to component.', type: 'success'});

        let dataQueries = [];
        for (let sink in this.$props.component.component.dataSinks) {
          let orderBy = '', limit = '';
          if (this.$props.component.component.dataSinks[sink].orderBy) {
            orderBy = `orderBy=${comp.dataSinks[key].orderBy}&`;
          }
          if (this.$props.component.component.dataSinks[sink].limit) {
            limit = `limit=${comp.dataSinks[key].limit}`;
          }
          dataQueries.push(fetch(`/d/r/${this.$props.component.component.dataSinks[sink].readKey}/${this.$props.component.component.dataSinks[sink].id}?${orderBy}${limit}`, {credentials: 'include'}).then(r => r.json()));
        }
        Promise.all(dataQueries).then(data => {
          let detail = {};
          for (let sink in this.$props.component.component.dataSinks) {
            detail[this.$props.component.component.dataSinks[sink].title] = data[sink];
          }
          let dataEvent = new CustomEvent('data', { detail });
          this.$props.component.node.dispatchEvent(dataEvent);
        });

        return true;
      }
      fetch('/api/datasinks/add', {method: 'POST', credentials: 'include'})
      .then(res => {
        res.json().then(r => {
          this.$props.component.component.dataSinks.push({ id: r.datasink.id, title: r.datasink.title, url: r.url, readKey: r.datasink.readKey });
          // TODO: ensure this query also returns the read/writekey, then commit to store here too.
          this.$store.commit('addNewDatasink', {id: r.datasink.id, title: r.datasink.title, latestDataPoint: null});
        }).catch(e => {
          this.$store.commit('addAlert', { msg: 'Error creating sink.', type: 'error'});
        });
      });
    },
    saveSettings(e) {
      if (!this.$refs.activeSettings) {
        let settingsEvent = new CustomEvent('settingsChanged', { detail: {} });
        this.$props.component.node.dispatchEvent(settingsEvent);
        this.$emit('close');
        flashSave();
        return false;
      }
      for (let el of this.$refs.activeSettings) {
        if (el.id === 'title') {
          this.$props.component.component.title = el.value;
          this.$props.component.node.querySelector(`#componentTitle-${this.$props.component.uuid}`).innerText = el.value;
        } else {
          this.$props.component.component.settings[el.id] = el.value;
        }
      }
      let settingsEvent = new CustomEvent('settingsChanged', { detail: {} });
      this.$props.component.node.dispatchEvent(settingsEvent);
      this.$emit('close');
      flashSave();
    },
    makeActive(e) {
      // if no event, it must be because we're returning from the existing datasinks dialog
      if (!e) e = { target: document.getElementById('dataSinks_tab') };
      const elements = document.getElementsByClassName('tab');
      for (let tab = 0; tab < elements.length; tab += 1) {
        elements[tab].removeAttribute('data-active');
      };
      e.target.setAttribute('data-active', true);
      this.activeComponent = e.target.id;
      setTimeout(() => this.populateForm(), 0);
    },
    populateForm() {
      if (!this.$refs.activeSettings) return false;
      for (let el of this.$refs.activeSettings) {
        if (el.id === 'title') {
          el.value = this.$props.component.component.title;
        } else {
          el.value = this.$props.component.component.settings[el.id];
        }
      }
    },
  },
  mounted() {
    this.populateForm();
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
  width: 50vw;
  height: 50vh;
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
  width: 33%;
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

.datasinks-toolbox {
  background-color: #eee;
  padding: 0.2rem 0.5rem;
  margin: 0.5rem 0;
  position: relative;
  display: inline-block;
  width: 100%;
  .toolbox-icon {
    position: relative;
    float: right;
    color: $primary-text;
    cursor: pointer;
  }
  .toolbox-icon:hover {
    color: lightgray;
  }
}
.datasink-listing {
  padding: 0.2rem 0.5rem;
}
.listing-title {
  margin-left: 0.5rem;
}
.listing-url {
  font-size: 0.8rem;
  margin-left: 1rem;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
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
