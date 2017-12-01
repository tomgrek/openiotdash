<template>
  <section class="container">
    <my-header :username="username"/>
    <h1 class="title">
      {{indexOptions.title}}
    </h1>
    <div class="links-container">
      <div v-if="username !== null">
        <div class="dashboards-header">
          <span class="dashboards-title">My Dashboards</span>
          <i class="material-icons inline" title="Dashboards provide a canvas to visualize and control data.">info_outline</i>
          <button class="small-button new-button" v-on:click="newDashboard">New</button>
          <button class="small-button delete-button" v-on:click="deleteDashboard">Delete</button>
        </div>
        <div class="dashboards-list">
          <ul>
            <li v-for="dashboard, i in dashboards" class="dashboards-list-item">
              <input type="checkbox" v-model="listOfCheckboxes[i]"></input>
              <nuxt-link target="_blank" :to="`/dash/${dashboard.id}`" class="link-cell" :title="dashboard.title">{{dashboard.title}}</nuxt-link>
              <nuxt-link target="_blank" :to="getLink(dashboard.link, dashboard.visibility)" class="link-cell wide" :title="getUrl(dashboard.link, dashboard.visibility)">{{getUrl(dashboard.link, dashboard.visibility)}}</nuxt-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="dashboards-header">
        <span class="dashboards-title">My Datasinks</span>
        <i class="material-icons inline" title="Datasinks provide endpoints to send data to.">info_outline</i>
        <button class="small-button new-button" v-on:click="newDatasink">New</button>
        <button class="small-button delete-button" v-on:click="deleteDatasink">Delete</button>
      </div>
      <table class="datasinks-list">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Schema</th>
            <th>Last Write</th>
            <th title="Whether sink can be publicly read">Visibility</th>
            <th title="Code that runs when a new datapoint comes in">Code</th>
            <th>Read Key</th>
            <th>Write Key</th>
          </tr>
        </thead>
        <tbody>
          <tr class="sink-row" v-for="datasink, i in datasinks">
            <td class="sink-cell"><input type="checkbox" v-model="listOfSinkCheckboxes[i]"></input></td>
            <td class="sink-cell text-link" title="Click to rename" @click="showRenameWindow(datasink)">{{datasink.title}}</td>
            <td class="sink-cell" title="Click to edit" @click="showSchemaWindow(datasink)" style="cursor: pointer;">{{datasink.schema ? '[Edit]' : '[None- Edit]'}}</td>
            <td class="sink-cell">{{formatTime(datasink.latestDataPoint)}}</td>
            <td class="sink-cell link icon-cell"><i class="material-icons" @click="toggleSinkVisibility(datasink)">{{visibilityIcon(datasink)}}</i></td>
            <td class="sink-cell link icon-cell"><i class="material-icons" @click="showCodeEditWindow(datasink)">settings_input_antenna</i></td>
            <td class="sink-cell">{{datasink.readKey}}</td>
            <td class="sink-cell">{{datasink.writeKey}}</td>
          </tr>
        </tbody>
      </table>
      <div class="dashboards-header">
        <span class="dashboards-title">My Authorized Devices
        <i class="material-icons inline" title="You can set datasinks to only accept writes from authorized devices that possess a secret x.509 key uniquely identifying them.">info_outline</i></span>
        <button class="small-button new-button" v-on:click="newDevice">New</button>
        <button class="small-button delete-button" v-on:click="deleteDevice">Delete</button>
      </div>
      <table class="datasinks-list">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Public Key</th>
            <th>Authorized On</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          <tr class="sink-row" v-for="device, i in devices">
            <td class="sink-cell"><input type="checkbox" v-model="listOfDeviceCheckboxes[i]"></input></td>
            <td class="sink-cell">{{device.title}}</td>
            <td class="sink-cell" :title="device.publicKey">... {{device.publicKey.slice(-45,-36)}}</td>
            <td class="sink-cell">{{formatTime(device.from)}}</td>
            <td class="sink-cell">{{formatTime(device.to)}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div><nuxt-link v-if="username === null" to="/login">Log In</nuxt-link></div>
    <div><nuxt-link v-if="username === null" to="/signup">Create An Account</nuxt-link></div>
    </div>
    <ModalCodeEdit v-if="codeEditWindowVisible" :sink="selectedSink" @close="dismissModals"/>
    <ModalRename v-if="renameWindowVisible" :setTitleFn="renameDatasink" :currentTitle="selectedSink.title" @close="dismissModals"/>
    <ModalSchemaEdit v-if="schemaWindowVisible" :sink="selectedSink" @close="dismissModals"/>
  </section>
</template>

<script>
import { title, indexOptions, baseUrl } from "~/components/config/config";
import { dows } from "~/config/mappings";

import axios from '~/plugins/axios';
import MyHeader from '~/components/Header.vue';
import ModalCodeEdit from '~/components/modal_codeedit.vue';
import ModalRename from '~/components/modal_rename.vue';
import ModalSchemaEdit from '~/components/modal_schemaedit.vue';

export default {
  name: 'index',
  middleware: ['authentication', 'dashboards', 'datasinks', 'devices'],
  components: {
    MyHeader,
    ModalCodeEdit,
    ModalRename,
    ModalSchemaEdit,
  },
  data() {
    return {
      listOfCheckboxes: [],
      listOfSinkCheckboxes: [],
      listOfDeviceCheckboxes: [],
      indexOptions,
      selectedSink: null,
      codeEditWindowVisible: false,
      renameWindowVisible: false,
      schemaWindowVisible: false,
    };
  },
  async asyncData(context) {
    return {
      username: context.username,
    }
  },
  head() {
    return {
      title,
    };
  },
  computed: {
    dashboards() {
      return this.$store.state.dashboards;
    },
    datasinks() {
      return this.$store.state.datasinks;
    },
    devices() {
      return this.$store.state.devices;
    },
  },
  watch: {
    dashboards(val) {
      this.listOfCheckboxes = val.map(x => false);
    },
  },
  mounted() {
    this.listOfCheckboxes = this.dashboards.map(x => false);
    this.listOfSinkCheckboxes = this.datasinks.map(x => false);
    if (this.devices.length) {
      this.listOfDeviceCheckboxes = this.devices.map(x => false);
    }
  },
  methods: {
    renameDatasink(newName) {
      const body = JSON.stringify({
        id: this.selectedSink.id,
        title: newName,
      });
      fetch(`/api/datasinks/rename/`, { credentials: 'include', method: 'POST', body, headers: {'Content-Type': 'application/json'} })
      .then(res => {
        if (res.status === 400) {
          this.$store.commit('addAlert', { msg: 'Invalid title for data sink.', type: 'error' });
        } else if (res.status === 409) {
          this.$store.commit('addAlert', { msg: 'Another data sink with that title already exists.', type: 'error' });
        } else {
          this.$store.commit('renameDatasink', { datasinkId: this.selectedSink.id, title: newName });
          this.$store.commit('addAlert', { msg: 'Title of data sink successfully set.', type: 'success'});
          this.dismissModals();
        }
      })
      .catch(e => {
        this.$store.commit('addAlert', { msg: 'Problem setting title: ' + e, type: 'error'});
        this.dismissModals();
      });
    },
    dismissModals() {
      this.codeEditWindowVisible = false;
      this.renameWindowVisible = false;
      this.schemaWindowVisible = false;
    },
    showCodeEditWindow(sink) {
      this.selectedSink = sink;
      this.codeEditWindowVisible = true;
    },
    showRenameWindow(sink) {
      this.selectedSink = sink;
      this.renameWindowVisible = true;
    },
    showSchemaWindow(sink) {
      this.selectedSink = sink;
      this.schemaWindowVisible = true;
    },
    toggleSinkVisibility(sink) {
      this.$store.commit('toggleSinkVisibility', sink.id);
      const body = JSON.stringify({
        id: sink.id,
        visibility: sink.visibility,
      });
      fetch(`/api/datasinks/changeVisibility/`, { credentials: 'include', method: 'POST', body, headers: {'Content-Type': 'application/json'} })
      .then(() => {
        this.$store.commit('addAlert', { msg: 'Visibility of data sinks successfully set.', type: 'success'});
      })
      .catch(e => {
        this.$store.commit('addAlert', { msg: 'Problem setting visibility: ' + e, type: 'error'});
      });
    },
    visibilityIcon(sink) {
      if (sink.visibility === 1) return 'visibility';
      return 'visibility_off';
    },
    formatTime(val) {
      if (!val) return '[Never]';
      let date = new Date(val);
      return dows[date.getDay()] + ', ' + date.toLocaleString();
    },
    getLink(link, visibility) {
      // for internal, routed links
      if (visibility === 0) return ''
      return '/show/' + link;
    },
    getUrl(link, visibility) {
      // for external links
      if (visibility === 0) return '[Not publicly visible]'
      return baseUrl + '/show/' + link;
    },
    async newDevice(e) {
      // TODO: need a way to provision many devices at once, maybe download certs/keys as a csv.
      let resp = await fetch('/api/devices/create', { credentials: 'include' }).then(r => r.json());
      this.$store.commit('addDevice', resp.device);
    },
    deleteDevice(e) {
    },
    newDatasink(e) {
      // TODO
    },
    deleteDatasink(e) {
      let toDelete = this.listOfSinkCheckboxes.reduce((acc, x, i) => {
        if (x) {
          acc.push(this.datasinks[i].id);
        }
        return acc;
      }, []);
      let qs = '';
      for (let item of toDelete) {
        qs = qs + `id=${item}&`;
      }
      fetch(`/api/datasinks/delete?${qs}`, {credentials: 'include'})
      .then(res => {
        for (let sink of toDelete) {
          this.$store.commit('deleteDatasink', sink);
        }
        this.listOfSinkCheckboxes = this.listOfSinkCheckboxes.map(x => false);
        this.$store.commit('addAlert', { msg: 'Datasink(s) deleted', type: 'success'});
      });
    },
    newDashboard(e) {
      fetch('/api/dashboards/new', {credentials: 'include'}).then(r => r.json())
        .then(res => {
          this.$store.commit('addAlert', { msg: 'New dashboard successfully created', type: 'success'});
          this.$store.commit('addDashboard', res);
        });
    },
    deleteDashboard(e) {
      let toDelete = this.listOfCheckboxes.reduce((acc, x, i) => {
        if (x) {
          acc.push(this.dashboards[i].id);
        }
        return acc;
      }, []);
      let qs = '';
      for (let item of toDelete) {
        qs = qs + `id=${item}&`;
      }
      fetch(`/api/dashboards/delete?${qs}`, {credentials: 'include'})
      .then(res => {
        for (let dash of toDelete) {
          this.$store.commit('deleteDashboard', dash);
        }
        this.listOfCheckboxes = this.listOfCheckboxes.map(x => false);
        this.$store.commit('addAlert', { msg: 'Dashboard(s) deleted', type: 'success'});
      });
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../assets/css/main.scss";

.title {
  margin: 30px 0;
  color: $primary-text;
}
.links-container {
  border: 1px solid $border-color;
  display: inline-block;
  width: 66%;
  line-height: 4rem;
  max-height: calc(100% - 20vh);
  overflow-y: scroll;
  overflow-y: overlay;
  overflow-x: hidden;
}
.dashboards-header {
  background-color: $background-dark;
  text-align: left;
  padding: 0 1rem;
  position: relative;
  .dashboards-title {
    font-weight: 900;
  }
  .new-button {
    position: absolute;
    right: 1rem;
    top: 1.1rem;
  }
  .delete-button {
    position: absolute;
    right: 5rem;
    top: 1.1rem;
  }
}

.dashboards-list {
  position: relative;
  line-height: 2rem;
  li {
    list-style: none;
  }
  .link-cell {
    display: inline-block;
    width: 36%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow:hidden;
  }
  .link-cell:hover {
    text-decoration: underline;
  }
  .wide {
    width: 63%;
    color: gray;
    font-size: 0.8rem;
  }
  input[type="checkbox"] {
    position: absolute;
    left: -1.4rem;
    top: 0.5rem;
  }
  .dashboards-list-item {
    text-align: left;
    padding: 0 1rem;
    position: relative;
  }
}
.datasinks-list {
  position: relative;
  line-height: 2.5rem;
  padding: 0 1rem;
  width: 100%;
  text-align: left;
  .sink-row {
  }
  .sink-cell {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow:hidden;
    &.link {
      cursor: pointer;
    }
    &.text-link {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
    &.icon-cell {
      // text-align: center;
    }
  }
  input[type="checkbox"] {
    margin-right: 1rem;
  }
  .datasink-list-item {
    text-align: left;
    padding: 0 1rem;
    position: relative;
  }
}
.material-icons.inline {
  top: 0.45rem;
  left: 1rem;
  position: relative;
  color: gray;
  cursor: help;
}
</style>
