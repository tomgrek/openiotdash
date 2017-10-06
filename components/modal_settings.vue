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
            <div class="tab" @click="makeActive" id="dataSources_tab">Data Sources</div> <!-- should just be data that's fetched when component mounts -->
            <div class="tab" @click="makeActive" id="offlineCode_tab">Offline Code</div>
          </div>
          <div v-if="activeComponent === 'offlineCode_tab'" style="height: calc(100% - 14rem); position: relative;">
            <div class="offlinecode-toolbox">
              <i v-on:click="saveCode" title="Save code for offline execution" class="material-icons toolbox-icon">save</i>
            </div>
            <p style="margin-before: 0;">Any code you add here will be run on the server every 10s. You have access to the component and its live data,
              and the <i>fetch</i> method. If your logic needs the component data updated more frequently than every 10s, use setInterval and fetch.</p>
            <textarea style="width: 100%; height: calc(100% - 2rem);" placeholder="setInterval(() => {
              console.log(component.dataSinks);
            }, 1000);" v-model="componentsOfflineCode"/>
          </div>
          <div v-if="activeComponent === 'settings_tab'">
            <form ref="activeSettings" v-html="component.component.settingsDisplay" />
          </div>
          <div v-if="activeComponent === 'dataSinks_tab'">
            <div class="datasinks-toolbox">
              <input type="checkbox" v-on:change="toggleAllSinks"></input>
              <i v-on:click="deleteDatasink" title="Remove selected data sinks from this component" class="material-icons toolbox-icon">delete</i>
              <i v-on:click="reuseDatasink" title="Add an existing data sink" class="material-icons toolbox-icon">playlist_add</i>
              <i v-on:click="addDatasink" title="Add a brand new data sink" class="material-icons toolbox-icon">add</i>
            </div>
            <div id="sinkContainer" class="datasink-listing" v-for="dataSink in component.component.dataSinks">
              <span>
                <input type="checkbox" v-on:change="toggleSink(dataSink, $event)"></input>
                <span class="listing-title">{{dataSink.title}}</span>
                <span class="listing-url">{{dataSink.url}}</span>
                <select class="sink-order-select" v-html="getSinkOrder(dataSink)" v-on:change="changeSinkOrder(dataSink, $event)"></select>
                <input class="limit-input" type="text" v-if="showingN(dataSink)" :value="dataSink.limit" v-on:input="changeLimit(dataSink, $event)"></input>
              </span>
            </div>
          </div>
          <div v-if="activeComponent === 'dataSources_tab'">
            <div class="datasources-toolbox">
              <input type="checkbox" v-on:change="toggleAllSources"></input>
              <i v-on:click="deleteDatasource" title="Remove selected data sources from this component" class="material-icons toolbox-icon">delete</i>
              <i v-on:click="addDatasource" title="Add a brand new data source" class="material-icons toolbox-icon">add</i>
            </div>
            <p>Datasources are (external) URLs that data is fetched from when the component is displayed and at intervals thereafter. If you need data fetched and processed
              when nobody is looking, take a look in Offline Code.</p>
            <table style="width: 100%; padding: 0 1rem 0 0.5rem;">
              <th></th>
              <th>Name</th>
              <th>URL To Call</th>
              <th>Interval (ms)</th>
              <tr v-for="dataSource in copyOfDatasources">
                <td><input style="margin-left:0;" type="checkbox" :id="'check-' + dataSource.id" v-on:change="toggleSource(dataSource, $event)"></input></td>
                <td class="datasourcelisting-title"><input type="text" class="datasourcelisting-title" v-model="dataSource.title"></input></td>
                <td class="datasourcelisting-url" ><input type="text" class="datasourcelisting-url" v-model="dataSource.url"></input></td>
                <td class="datasourcelisting-interval-td"><input type="text" class="datasourcelisting-interval" v-model="dataSource.interval"></input></td>
              </tr>
            </table>
          </div>
          <div style="position: absolute; bottom: 1rem; right: 1rem; display: inline-block; width:100%;">
            <button class="small-button" @click="$emit('close')" style="float: right;">Cancel</button>
            <button class="small-button" @click="saveSettings()" style="margin-right: 0.5rem; float:right;">Save</button>
          </div>
        </div>
        <ModalDatasinks v-if="reuseDatasinkWindowVisible" @close="dismissReuseDatasinksWindow" :add="addDatasink" :forSource="activeComponent === 'dataSources_tab'"/>
      </div>
    </div>
  </transition>
</template>

<script>
import { flashSave, getUuid } from '~/plugins/utils';
import wrapPromise from '../clientutils/promisewrapper';
import ModalDatasinks from '~/components/modal_datasinks';

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
      selectedSources: [],
      reuseDatasinkWindowVisible: false,
      mainWindowVisible: true,
      showingLimitInput: (() => {
        let obj = {};
        for (let sink of this.$props.component.component.dataSinks) {
          if (sink.orderBy === 'createdAt DESC') {
            obj[sink.title] = true;
          } else {
            obj[sink.title] = false;
          }
        }
        return obj;
      })(),
      componentsOfflineCode: (() => {
        if (this.$props.component.component.offlineCode) return this.$props.component.component.offlineCode;
        return '';
      })(),
      needToFetchNewData: false,
      copyOfDatasources: JSON.parse(JSON.stringify(this.$props.component.component.dataSources)),
    }
  },
  computed: {
  },
  methods: {
    saveCode(e) {
      this.$props.component.component.offlineCode = this.componentsOfflineCode;
    },
    changeLimit(sink, e) {
      let val = parseInt(e.target.value);
      if (!val) return;
      sink.limit = e.target.value;
      this.needToFetchNewData = true;
    },
    changeSinkOrder(sink, e) {
      this.needToFetchNewData = true;
      if (e.target.value === 'Most recent') {
        sink.orderBy = 'createdAt DESC';
        sink.limit = 100;
        this.showingLimitInput[sink.title] = true;
      } else {
        sink.orderBy = undefined;
        sink.limit = undefined;
        this.showingLimitInput[sink.title] = false;
      }
    },
    showingN(sink) {
      if (this.showingLimitInput[sink.title]) return true;
      return false;
    },
    getSinkOrder(sink) {
      if (sink.orderBy === 'createdAt DESC') {
        return `<option>All data points</option><option selected>Most recent</option>`;
      }
      return `<option selected>All data points</option><option>Most recent</option>`
    },
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
    toggleAllSources(e) {
      if (e.target.checked) {
        this.selectedSources = [].concat(this.$props.component.component.dataSources);
        for (let el of document.getElementById('sourceContainer').querySelectorAll('input[type="checkbox"]')) {
          el.checked = true;
        }
      } else {
        this.selectedSources = [];
        for (let el of document.getElementById('sourceContainer').querySelectorAll('input[type="checkbox"]')) {
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
    toggleSource(source, e) {
      if (!e.target.checked && this.selectedSources.map(x => x.id).includes(source.id)) {
        this.selectedSources = this.selectedSources.filter(x => x.id !== source.id);
      } else {
        if (e.target.checked) {
          this.selectedSources.push(source);
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
      this.selectedSinks = [];
      this.toggleAllSinks({target: false});
    },
    deleteDatasource() {
      this.copyOfDatasources = this.copyOfDatasources.filter(x => !this.selectedSources.map(y => y.id).includes(x.id));
    },
    addDatasource() {
      let idAndTitle = getUuid();
      this.copyOfDatasources.push({title: idAndTitle, url: '', interval: 10000, id: idAndTitle});
    },
    reuseDatasink(dataSource) {
      this.mainWindowVisible = false;
      this.reuseDatasinkWindowVisible = true;
    },
    fetchNewData() {
      let dataQueries = [];
      for (let sink in this.$props.component.component.dataSinks) {
        let orderBy = '', limit = '';
        if (this.$props.component.component.dataSinks[sink].orderBy) {
          orderBy = `orderBy=${this.$props.component.component.dataSinks[sink].orderBy}&`;
        }
        if (this.$props.component.component.dataSinks[sink].limit) {
          limit = `limit=${this.$props.component.component.dataSinks[sink].limit}`;
        }
        dataQueries.push(fetch(`/d/r/${this.$props.component.component.dataSinks[sink].readKey}/${this.$props.component.component.dataSinks[sink].id}?${orderBy}${limit}`, {credentials: 'include'}).then(r => r.json()));
      }
      for (let source of this.$props.component.component.dataSources) {
        dataQueries.push(wrapPromise(fetch(source.url)));
      }
      Promise.all(dataQueries).then(data => {
        let detail = {};
        for (let sink in this.$props.component.component.dataSinks) {
          detail[this.$props.component.component.dataSinks[sink].title] = data[sink];
        }
        let sinksLength = this.$props.component.component.dataSinks.length;
        for (let source in this.$props.component.component.dataSources) {
          if (typeof data[source + sinksLength] !== 'string') {
            // TODO: not sure if this will correctly detect json vs text response, maybe try json first and in catch do text.
            if (data[parseInt(source) + sinksLength].json) {
              data[parseInt(source) + sinksLength].json().then(r => {
                let detail = {};
                detail[this.$props.component.component.dataSources[source].title] = r;
                let dataEvent = new CustomEvent('data', { detail });
                this.$props.component.node.dispatchEvent(dataEvent);
              });
            } else if (data[parseInt(source) + sinksLength].text) {
              data[parseInt(source) + sinksLength].text().then(r => {
                let detail = {};
                detail[this.$props.component.component.dataSources[source].title] = r;
                let dataEvent = new CustomEvent('data', { detail });
                this.$props.component.node.dispatchEvent(dataEvent);
              });
            }
          } else {
            // it was a caught exception
            detail[this.$props.component.component.dataSources[source].title] = [];
          }
        }
        let dataEvent = new CustomEvent('data', { detail });
        this.$props.component.node.dispatchEvent(dataEvent);
      }).catch(e => console.log(e));
    },
    addDatasink(existingSinks, connectingToSource) { // existingSink is optional, coming from the modal_datasinks
      if (connectingToSource) {
        // do something completely different - reusing the component for sth it wasnt meant for
        setTimeout(() => {
          for (let el of document.getElementById('sourceContainer').querySelectorAll('input[type="checkbox"]')) {
            el.checked = false;
          }
          document.getElementById('check-' + this.selectedSources[0].id).checked = true;
        }, 0);
        this.selectedSources[0].connectedSink = existingSinks[0].title;
        return;
      }
      if (Array.isArray(existingSinks)) {
        for (let sink of existingSinks) {
          this.$props.component.component.dataSinks.push({ id: sink.id, title: sink.title, readKey: sink.readKey, url: 'NEEDTOSET', limit: sink.limit || undefined, orderBy: sink.orderBy || undefined});
          this.showingLimitInput[sink.title] = sink.orderBy === 'createdAt DESC' ? true : false;
        }
        this.$store.commit('addAlert', { msg: 'Data sinks added to component, fetching new data...', type: 'success'});
        this.fetchNewData();
        return true;
      }
      // if its a pure new datasink, just do this. no need to fetch new data
      fetch('/api/datasinks/add', {method: 'POST', credentials: 'include'})
      .then(res => {
        res.json().then(r => {
          this.$props.component.component.dataSinks.push({ id: r.datasink.id, title: r.datasink.title, url: r.url, readKey: r.datasink.readKey, limit: undefined, orderBy: undefined });
          // TODO: ensure this query also returns the read/writekey, then commit to store here too.
          this.$store.commit('addNewDatasink', {id: r.datasink.id, title: r.datasink.title, latestDataPoint: null});
          this.showingLimitInput[r.datasink.title] = false;
        }).catch(e => {
          this.$store.commit('addAlert', { msg: 'Error creating sink.', type: 'error'});
        });
      });
    },
    saveSettings(e) {
      for (let interval of this.$props.component.intervals) {
        window.clearInterval(interval.timer);
      }
      for (let source of this.$props.component.component.dataSources) {
        delete this.$props.component.component.data[source.title];
        let newDataEvent = new CustomEvent('newData', { detail: { dataSource: source, newData: [] } });
        this.$props.component.node.dispatchEvent(newDataEvent);
      }
      this.$props.component.component.dataSources = this.copyOfDatasources;
      for (let source of this.$props.component.component.dataSources) {
        this.$props.component.intervals.push({sourceTitle: source.title, timer: setInterval(() => {
          fetch(source.url).then(r => r.json()).then(resp => {
            let newDataEvent = new CustomEvent('newData', { detail: { dataSource: source, newData: resp } });
            this.$props.component.node.dispatchEvent(newDataEvent);
          });
        }, source.interval) });
      }
      if (!this.$refs.activeSettings) {
        let settingsEvent = new CustomEvent('settingsChanged', { detail: {} });
        this.$props.component.node.dispatchEvent(settingsEvent);
        this.$emit('close');
        flashSave();
        //if (this.needToFetchNewData) {
          this.fetchNewData();
        //}
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
      //if (this.needToFetchNewData) {
        this.fetchNewData();
      //}
      this.$emit('close');
      flashSave();
    },
    makeActive(e) {
      // if no event, it must be because we're returning from the existing datasinks dialog
      if (!e) e = { target: document.getElementById(this.activeComponent) };
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
  width: 25%;
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

.datasinks-toolbox, .datasources-toolbox, .offlinecode-toolbox {
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
.datasink-listing, .datasource-listing {
  padding: 0.2rem 0.5rem;
}
.listing-title {
  margin-left: 0.5rem;
}
.listing-url {
  font-size: 0.8rem;
  margin-left: 1rem;
}
.datasourcelisting {
  margin-left: 0;
}
.datasourcelisting-title {
  width: 6rem;
}
.datasourcelisting-url {
  font-size: 0.8rem;
  margin-left: 0;
  width: 100%;
}
.datasourcelisting-interval {
  width: 6rem;
}
.datasourcelisting-interval-td {
  width: 6rem;
}
.listing-settings-icon {
  cursor: pointer;
  color: gray;
  i {
    position: relative;
    top: 0.4rem;
  }
}
.sink-order-select {
  margin-left: 1rem;
}
.limit-input {
  line-height: 1rem;
  width: 3rem;
  text-align: right;
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
