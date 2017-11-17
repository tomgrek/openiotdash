<template>
  <section class="container">
    <ModalRename v-if="showModal_rename" @close="showModal_rename = false" :currentTitle="dashboard.title" :setTitleFn="setTitle"/>
    <ModalSave v-if="showModal_save" @close="showModal_save = false" :currentDashboard="dashboard" :saveFn="saveAll"/>
    <ModalSettings v-if="showModal_settings" @close="showModal_settings = false" :component="selectedComponent"/>
    <ModalDashSettings v-if="showModal_dashsettings" @close="showModal_dashsettings = false" :currentScheme="dashboard.scheme" :setSchemeFn="setDashScheme"/>
    <my-header :username="username" :extended="dashboard.title"/>
    <div class="main-container">
      <div id="canvasContainer"></div>
      <div v-once class="canvas-container" v-on:dragover="nothing($event)" v-on:drop="nothing($event)">
      </div>
      <div class="sidebar">
        <div class="sidebar-header">Manage</div>
        <i id="save-dash-button" @click="showModal_save = true" class="material-icons toolicon" style="margin-bottom: 0.5rem; margin-right: 0.5rem; transition: filter 1s ease;" title="Save">save</i>
        <i @click="showModal_rename = true" class="material-icons toolicon" style="margin-bottom: 0.5rem; margin-right: 0.5rem;" title="Rename">title</i>
        <i @click="showModal_dashsettings = true" class="material-icons toolicon" style="margin-bottom: 0.5rem; margin-right: 0.5rem;" title="Settings">settings</i>
        <i class="material-icons toolicon" style="margin-bottom: 0.5rem;" title="Delete">delete</i>
        <div class="sidebar-header">Components</div>
        <div v-for="component, i in predefinedComponents" v-html="component().preview" class="component" draggable=true v-on:dragstart="startDrag($event, i)" v-on:dragend="dropped($event, i)"></div>
      </div>
    </div>
  </section>
</template>

<script>
import { title, indexOptions, host, port, gitUrl } from "~/components/config/config";
import * as d3 from "d3";
import axios from '~/plugins/axios';
import socket from '~/plugins/socket.io.js'

import mqtt from '../../node_modules/mqtt/dist/mqtt.min.js';

import MyHeader from '~/components/Header';
import ModalRename from '~/components/modal_rename';
import ModalSave from '~/components/modal_save';
import ModalSettings from '~/components/modal_settings';
import ModalDashSettings from '~/components/modal_dashsettings';

import Tester from '../../predefined_components/Tester';
import Chart from '../../predefined_components/Chart';
import Bubble from '../../predefined_components/Circle';
import CanvasBubble from '../../predefined_components/Bubble';
import Header from '../../predefined_components/Header';
import Map from '../../predefined_components/Map';

import { fakeDrop, updateableDropPart } from '../../clientutils/utils';

export default {
  name: 'dash',
  middleware: ['authentication', 'dashboards', 'datasinks'],
  components: {
    MyHeader,
    ModalRename,
    ModalSave,
    ModalSettings,
    ModalDashSettings,
  },
  data() {
    return {
      indexOptions,
      components: [],
      individualComponents: [],
      predefinedComponents: [
         Map,
         CanvasBubble,
         Chart,
         Tester,
         Bubble,
         Header,
      ],
      dragged: null,
      zoomed: null,
      svgOffsetX: 0,
      svgOffsetY: 0,
      clickOffsetX: false,
      clickOffsetY: false,
      showModal_rename: false,
      showModal_save: false,
      showModal_settings: false,
      showModal_dashsettings: false,
      selectedComponent: null,
      title: null,
      dashboard: null,
      darkStyleSheet: null,
    };
  },
  watch: {
    // individualComponents(val) {
    //   console.log(val);
    //   this.$store._vm.$watch(() => this.individualComponents, console.log, { deep: true, immediate: true });
    // },
  },
  computed: {
    username() {
      return this.$store.state.authUser;
    },
  },
  methods: {
    setScheme(scheme) {
      if (scheme && scheme !== 'light') {
        this.darkStyleSheet = document.createElement('link');
        this.darkStyleSheet.type = 'text/css';
        this.darkStyleSheet.rel = 'stylesheet';
        this.darkStyleSheet.href = '/' + scheme + '.css';
        document.body.append(this.darkStyleSheet);
      }
      if (scheme === 'light') {
        if (this.darkStyleSheet) {
          this.darkStyleSheet.remove();
        }
      }
    },
    fakeDrop(fullComponent) {
      return fakeDrop(fullComponent, this, true);
    },
    setDashScheme(scheme) { // color scheme
      let oldScheme = this.dashboard.scheme;
      this.dashboard.scheme = scheme;
      let body = JSON.stringify({id: this.$route.params.id, scheme: scheme.toLowerCase()});
      fetch(`/api/dashboards/save/scheme`, {headers: {'Content-Type': 'application/json'}, method: 'POST', body, credentials: 'include'})
        .then(resp => {
          if (resp.status !== 200) {
            this.dashboard.scheme = oldScheme;
            this.$store.commit('addAlert', { msg: 'Error saving scheme.', type: 'error'});
          } else {
            this.$store.commit('addAlert', { msg: 'Scheme saved successfully.', type: 'success'});
            this.$store.commit('setColorSchemeOfDashboard', {id: parseInt(this.$route.params.id), newScheme: scheme, setScheme: this.setScheme});
          }
        });
    },
    setTitle(title) {
      let oldTitle = this.dashboard.title;
      this.dashboard.title = title;
      let body = JSON.stringify({id: this.$route.params.id, title: title});
      fetch(`/api/dashboards/save/title`, {headers: {'Content-Type': 'application/json'}, method: 'POST', body, credentials: 'include'})
        .then(resp => {
          if (resp.status !== 200) {
            this.dashboard.title = oldTitle;
            this.$store.commit('addAlert', { msg: 'Error saving new name.', type: 'error'});
          } else {
            this.$store.commit('addAlert', { msg: 'New name saved successfully.', type: 'success'});
            this.$store.commit('renameDashboard', {id: parseInt(this.$route.params.id), newTitle: title});
          }
        });
    },
    setVisibility(visibility) {
      let oldVisibility = this.dashboard.visibility;
      this.dashboard.visibility = visibility;
      let body = JSON.stringify({id: this.$route.params.id, visibility: visibility});
      fetch(`/api/dashboards/save/visibility`, {headers: {'Content-Type': 'application/json'}, method: 'POST', body, credentials: 'include'})
        .then(resp => {
          if (resp.status !== 200) {
            this.dashboard.visibility = oldVisibility;
            this.$store.commit('addAlert', { msg: 'Error setting visibility.', type: 'error'});
          } else {
            this.$store.commit('addAlert', { msg: 'Visibility saved successfully.', type: 'success'});
          }
        });
    },
    saveAll() {
      for (let comp of this.individualComponents) {
        comp.component.offsetX = comp.node.attributes['offsetX'].value || 0;
        comp.component.offsetY = comp.node.attributes['offsetY'].value || 0;
        let event = new CustomEvent('beforeSave', {});
        comp.node.dispatchEvent(event);
        // TODO: Now if you resize the map after saving, well, there is no map. Restore it somehow.
      }
      let dashToSave = JSON.parse(JSON.stringify({ components: this.individualComponents, svgOffsetX: 0, svgOffsetY: 0 }));
      for (let comp of dashToSave.components) {
        comp.component.data = {};
      }
      // TODO: No, dont set it to zero. Create a new copy of it, with the data set to zero, and save that.
      let body = JSON.stringify({ id: this.$route.params.id, definition: JSON.stringify(dashToSave), visibility: this.dashboard.visibility, title: this.dashboard.title });
      fetch(`/api/dashboards/save/all`, {headers: {'Content-Type': 'application/json'}, method: 'POST', body, credentials: 'include'})
        .then(resp => {
          if (resp.status !== 200) {
            this.$store.commit('addAlert', { msg: 'Error saving dashboard.', type: 'error'});
          } else {
            this.$store.commit('addAlert', { msg: 'Dashboard saved successfully.', type: 'success'});
            if (window.intervals) {
              for (let interval of window.intervals) {
                window.clearInterval(window.intervals);
              }
            }
          }
          for (let comp of this.individualComponents) {
            updateableDropPart(comp);
          }
        });
    },
    nothing(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    startDrag(e, id) {
      e.dataTransfer.setData("text/html", e.target.id);
      let me = document.getElementsByClassName('component')[id];
      e.dataTransfer.setDragImage(me, me.clientWidth / 2, me.clientHeight / 2);
    },
    dropped(e, id) {
      e.preventDefault();
      e.stopPropagation();
      let newComp = { component: this.predefinedComponents[id]() };
      newComp.component.offsetX = e.pageX - (newComp.component.width/2);
      newComp.component.offsetY = e.pageY - newComp.component.height;
      let comp = this.fakeDrop(newComp, this, true);
      comp.uuid = comp.component.uuid;
      this.$store.commit('addAlert', { msg: 'Hold shift to resize', type: 'info'});
    },
  },
  async asyncData(context) {
    let queries = [];
    queries.push(axios.get(`/data/dashboard/${context.params.id}`));
    let results = await Promise.all(queries);
    context.store.commit('setSelectedDashboard', results[0].data);
    return {
       dashboard: results[0].data,
    };
  },
  head() {
    if (!this.dashboard) {
      // this is only needed because presently nuxt doesn't re-call asyncData to load the
      // dashboard object when webpack does a hot push. And maybe there's a bug in Vue because
      // it's impossible to try/catch/prevent.
      location.reload();
    }
    if (this.dashboard && this.dashboard.title) return { title: this.dashboard.title };
    return {
      title: '',
    };
  },
  mounted() {
    if (!this.dashboard) return;
    this.setScheme(this.dashboard.scheme);
    let self = this;
    window.d3 = d3;
    window.Mqtt = mqtt; // a global object, can connect to any MQTT broker
    window.mqtt = mqtt.connect({ host, port }); // An mqtt instance already connected to the host server
    delete window.socket;
    window.socket = socket;

    window.onkeydown = e => {
      function stopShowingResizer(e) {
        for (var node of document.getElementsByClassName('resizer')) {
          node.style.visibility = 'hidden';
        }
        window.removeEventListener('keyup', stopShowingResizer, false);
      };
      if (e.key === 'Shift') {
        window.addEventListener('keyup', stopShowingResizer, false);
        for (var node of document.getElementsByClassName('resizer')) {
          node.style.visibility = 'visible';
        }
      }
    };
    window.showSettings = (uuid) => {
      let me = this.individualComponents.filter(x => x.uuid === uuid)[0];
      this.selectedComponent = me;
      this.showModal_settings = true;
      let settingsEvent = new CustomEvent('settings');
      me.node.dispatchEvent(settingsEvent);
    };
    window.deleteComponent = (uuid) => {
      let me = this.individualComponents.filter(x => x.uuid === uuid)[0];
      this.components = this.components.filter(x => x.node() !== me.node);
      let deleteEvent = new CustomEvent('delete');
      me.node.dispatchEvent(deleteEvent);
      me.node.parentElement.removeChild(me.node);
      this.individualComponents = this.individualComponents.filter(x => x.uuid !== uuid);
    }
    let bbox = document.getElementsByClassName('canvas-container')[0].getBoundingClientRect();
    const width = parseInt(bbox.width);
    const height = parseInt(bbox.height);
    let svg = d3.select(".canvas-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("z-index", "-1")
        .style("transform", "translateZ(0)")
      .append("g")
    let rect = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all");

    let container = svg.append("g");

    container.append("g")
      .attr("class", "x axis")
      .selectAll("line")
      .data(d3.range(0, width, 10))
      .enter()
        .append("line")
          .attr("x1", function(d) { return d; })
          .attr("y1", 0)
          .attr("x2", function(d) { return d; })
          .attr("y2", height);
    container.append("g")
      .attr("class", "y axis")
      .selectAll("line")
      .data(d3.range(0, height, 10))
      .enter()
        .append("line")
          .attr("x1", 0)
          .attr("y1", function(d) { return d; })
          .attr("x2", width)
          .attr("y2", function(d) { return d; });

    let c = d3.select('.canvas-container');
    let c_node = c.node();

    function dragged() {
      let elm = this;
      if (d3.event.sourceEvent.shiftKey) return;
      d3.event.sourceEvent.stopPropagation();
      if (d3.event.sourceEvent.target.className !== 'title-bar') {
        if (!self.clickOffsetX) return;
      }

      let x = d3.event.x;
      let y = d3.event.y;

      let style = elm.style.transform;
      let st = style.match(/scale\((.*)\)/i);

      // This should keep the component on the board, but decided not critical for now.
      // let elW = parseInt(elm.style.width) / 2;
      // let elH = parseInt(elm.style.height);
      // let left = parseInt(style.slice(style.indexOf('(') + 1, style.indexOf(',')));
      // if (x + left < (self.svgOffsetX+elW)) {
      //
      //   console.log(x, self.svgOffsetX, elW, style, left);
      //   return;
      // }
      // if (x + elW > width + self.svgOffsetX) return;
      // if (y < (self.svgOffsetY)) return;
      // if (y + elH > height + self.svgOffsetY) return;

      if (!self.clickOffsetX) {
        let smaller = parseInt(style.split(',')[0].split('(')[1]);
        let smallerY = parseInt(style.split(',')[1].split(')')[0]);
        self.clickOffsetX = x - smaller;
        self.clickOffsetY = y - smallerY;
      }

      let styleStr = 'translate(' + (x - self.clickOffsetX) + 'px, ' + (y - self.clickOffsetY) + 'px)';
      if (st !== null && st[1]) {
        styleStr = styleStr + ' scale(' + parseFloat(st[1]) + ')';
      }
      let meD3 = d3.select(elm);

      let newOffsetX = (x - self.svgOffsetX - self.clickOffsetX);
      let newOffsetY = (y - self.svgOffsetY - self.clickOffsetY);
      let createdEvent = new CustomEvent('moved', { detail: { transform: styleStr, offsetX: newOffsetX, offsetY: newOffsetY } });
      self.individualComponents.filter(x => x.uuid === meD3.attr('uuid'))[0].node.dispatchEvent(createdEvent);
      meD3.style('transform', styleStr);
      meD3.attr('offsetX', newOffsetX);
      meD3.attr('offsetY', newOffsetY);
    }
    this.dragged = dragged;

    const zoomed = () => {
      let transform = d3.event.transform;
      let boxTransform = Math.pow(transform.k, 3);
      for (let selection of this.components) {
        selection.style("transform", "translate(" + (transform.x + parseFloat(selection.attr('offsetX')) ) + "px, " + (transform.y + parseFloat(selection.attr('offsetY'))) + "px) scale(" + (boxTransform) + ")");
        selection.style("box-shadow", `${(boxTransform-1)*10}px ${(boxTransform-1)*10}px ${(boxTransform-1)*30}px lightgray`);
      }
      svg.attr("transform", "translate(" + transform.x + ", " + transform.y + ") scale(" + transform.k + ")");
      self.svgOffsetY = transform.y;
      self.svgOffsetX = transform.x;
    }
    let zoom = d3.zoom()
        .scaleExtent([1, 24])
        .translateExtent([[-c_node.clientWidth, -c_node.clientHeight], [c_node.clientWidth*2, c_node.clientHeight*2]])
        .on("zoom", zoomed);

    c.call(zoom);

    let def = JSON.parse(this.dashboard.definition);
    this.svgOffsetX = def.svgOffsetX;
    this.svgOffsetY = def.svgOffsetY;

    if (def.components && def.components.length) {
      for (let component of def.components) {
        this.fakeDrop(component);
      }
    }
    if (gitUrl) {
      fetch(gitUrl).then(r => r.json()).then(r => {
        for (let file of r) {
          fetch(file.download_url).then(r => {
              r.json().then(r => {
                // use http://phrogz.net/JS/NeatJSON/ for this
                this.predefinedComponents.push(() => r);
            }).catch(e=>{  }); // do nothing if it's not a JSON file, e.g. README.md
          }).catch(e=>console.log);
        }
      });
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../../assets/css/main.scss";

::-webkit-scrollbar {
  width: 0.5rem;
  background-color: #fefeff;
}
::-webkit-scrollbar-track {

}
::-webkit-scrollbar-thumb {
  background: rgba(11,11,14,0.2);
  border-radius: 4px;
}

.title {
  margin: 30px 0;
  color: $primary-text;
}
.links-container {
  border: 1px solid $border-color;
  display: inline-block;
  width: 33%;
  line-height: 4rem;
  nuxt-link {
    text-decoration: underline;
  }
}
.main-container {
  text-align: left;
  padding: 1rem 1rem;
  display: block;
  position: relative;
  height: 90%;
  transform: translateZ(0);
}
.sidebar {
  width: 16rem;
  background-color: $background-color;
  height: 100%;
  display: inline-block;
  position: relative;
  border-left: 1px solid $dark-border;
  border-right: 0;
  padding: 0 0 0 1rem;
  float: right;
  overflow-y: auto;
  .sidebar-header {
    background-color: $background-dark;
    padding: 0.5rem 0.5rem;
    margin-bottom: 0.5rem;
  }
  .component {
    display: inline-block;
    position: relative;
    border: 1px solid black;
    width: 100%;
    height: 8rem;
    margin-bottom: 0.5rem;
  }
}
.canvas-container {
  overflow: hidden;
  height: 100%;
  opacity: 0.9;
  position: relative;
  width: calc(100% - 16rem);
  text-align: left;
  display: inline-block;
}
</style>
