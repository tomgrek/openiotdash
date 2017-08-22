<template>
  <div class="modal-wrapper">
    <div v-if="mainWindowVisible" class="modal-container">
      <span class="close-icon" @click="$emit('close')"><i class="material-icons">close</i></span>
      <div class="modal-header">Existing Datasinks</div>
      <div class="datasinks-toolbox">
        <input type="checkbox" v-on:change="toggleAllSinks"></input>
        <i v-on:click="addDatasinks" title="Add selected data sinks to component" class="material-icons toolbox-icon">add</i>
        <i v-on:click="changeVisibility" title="Set whether selected datasinks are publicly readable" class="material-icons toolbox-icon">visibility</i>
      </div>
      <div class="sink-outer" id="sinkContainerAll">
        <div class="sink-inner-scroll">
          <table class="datasink-table">
            <!-- <th> -->
              <th></th>
              <th>Title</th>
              <th>Code</th>
              <th>Read Key</th>
              <th title="Whether sink can be publicly read">Visibility</th>
              <th>Write Key</th>
              <th>Last Written</th>
            <!-- </th> -->
            <tr class="datasink-listing" v-for="dataSink in dataSinks">
              <td><input type="checkbox" v-on:change="toggleSink(dataSink, $event)"></input></td>
              <td><span class="listing-title">{{dataSink.title}}</span></td>
              <td><span v-on:click="showCodeEditWindow(dataSink)" class="inline-icon"><i class="material-icons">settings_input_antenna</i></span></td>
              <td><span class="listing-url">{{dataSink.readKey}}</span></td>
              <td><i class="material-icons">{{visibilityIcon(dataSink)}}</i></td>
              <td><span class="listing-url">{{dataSink.writeKey}}</span></td>
              <td><span class="listing-url" v-html="formatTime(dataSink.latestDataPoint)"></span></td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <ModalCodeEdit v-if="codeEditWindowVisible" :sink="selectedSink" @close="dismissModals"/>
    <ModalSinkVisibility v-if="visibilityWindowVisible" :sinks="selectedSinks" @close="dismissModals" />
  </div>
</template>

<script>
import ModalCodeEdit from './modal_codeedit.vue';
import ModalSinkVisibility from './modal_sinkvisibility';

export default {
  name: 'datasinksmodal',
  props: ['add', 'forSource'], // if forSource is true we're connecting a sink to a source, not just adding it to a component
  components: {
    ModalCodeEdit,
    ModalSinkVisibility,
  },
  data() {
    return {
      selectedSinks: [],
      mainWindowVisible: true,
      codeEditWindowVisible: false,
      selectedSink: null,
      visibilityWindowVisible: false,
    }
  },
  computed: {
    dataSinks() {
      return this.$store.state.datasinks;
    },
  },
  methods: {
    visibilityIcon(sink) {
      if (sink.visibility === 1) return 'visibility';
      return 'visibility_off';
    },
    showCodeEditWindow(sink) {
      this.selectedSink = sink;
      this.mainWindowVisible = false;
      this.codeEditWindowVisible = true;
    },
    dismissModals() {
      this.codeEditWindowVisible = false;
      this.visibilityWindowVisible = false;
      this.mainWindowVisible = true;
    },
    changeVisibility() {
      this.mainWindowVisible = false;
      this.visibilityWindowVisible = true;
    },
    addDatasinks() {
      this.$props.add(this.selectedSinks, this.$props.forSource);
      this.$emit('close');
    },
    toggleAllSinks(e) {
      if (e.target.checked) {
        this.selectedSinks = [].concat(this.dataSinks);
        for (let el of document.getElementById('sinkContainerAll').querySelectorAll('input[type="checkbox"]')) {
          el.checked = true;
        }
      } else {
        this.selectedSinks = [];
        for (let el of document.getElementById('sinkContainerAll').querySelectorAll('input[type="checkbox"]')) {
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
    formatTime(t) {
      if (t === null) return '';
      let d = new Date(t);
      return d.toLocaleString();
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~assets/css/main.scss";
.modal-wrapper {
  display: block;
  vertical-align: middle;
  width: 66vw;
  margin-left: auto;
  margin-right: auto;
}
.modal-container {
  width: 66vw;
  height: 50vh;
  overflow: hidden;
  margin: 0px auto;
  padding: 1rem 1.5rem;
  background-color: #fff;
  border-radius: 2px;
  border: 2px solid black;
  transition: all .3s ease;
  font-family: Roboto Slab, serif;
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
  font-weight: 900;
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
.sink-outer {
  overflow: hidden;
  position: relative;
  height: calc(100% - 5rem);
  white-space: nowrap;
}
.sink-inner-scroll {
  overflow: auto;
  height: 100%;
}
.datasink-table {
  padding-left: 0.5rem;
  width: 100%;
  font-family: "Source Sans Pro", sans-serif;
}
.inline-icon {
  i {
    font-size: 1rem;
    top: 2px;
    position: relative;
    cursor: pointer;
    color: gray;
  }
  i:hover {
    color: black;
  }
}
.listing-url {
  font-size: 0.8rem;
}
</style>
