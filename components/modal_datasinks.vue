<template>
  <div class="modal-container">
    <span class="close-icon" @click="$emit('close')"><i class="material-icons">close</i></span>
    <div class="modal-header">Existing Datasinks</div>
    <div class="datasinks-toolbox">
      <input type="checkbox" v-on:change="toggleAllSinks"></input>
      <i v-on:click="addDatasinks" title="Add selected data sinks to component" class="material-icons toolbox-icon">add</i>
    </div>
    <div class="sink-outer" id="sinkContainerAll">
      <div class="sink-inner-scroll">
        <div class="datasink-listing" v-for="dataSink in dataSinks">
          <span>
            <input type="checkbox" v-on:change="toggleSink(dataSink, $event)"></input>
            <span class="listing-title">{{dataSink.title}}</span>
            <span class="listing-url">{{dataSink.readKey}}</span>
            <span class="listing-url">{{dataSink.writeKey}}</span>
            <span class="listing-url" v-html="formatTime(dataSink.latestDataPoint)"></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'datasinksmodal',
  props: ['add', 'forSource'], // if forSource is true we're connecting a sink to a source, not just adding it to a component
  data() {
    return {
      selectedSinks: [],
    }
  },
  computed: {
    dataSinks() {
      return this.$store.state.datasinks;
    },
  },
  methods: {
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

.modal-container {
  width: 50vw;
  height: 50vh;
  overflow: hidden;
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
}
.sink-inner-scroll {
  overflow: auto;
  height: 100%;
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
</style>
