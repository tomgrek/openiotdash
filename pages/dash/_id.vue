<template>
  <section class="container">
    <ModalRename v-if="showModal" @close="showModal = false" :currentTitle="dashboard.title" :setTitleFn="setTitle"/>
    <my-header :username="username" :extended="dashboard.title"/>
    <div class="main-container">
      <div v-once class="canvas-container" v-on:dragover="nothing($event)" v-on:drop="nothing($event)">
      </div>
      <div class="sidebar">
        <div class="sidebar-header">Manage</div>
        <i class="material-icons toolicon" style="margin-bottom: 0.5rem; margin-right: 0.5rem;" title="Save">save</i>
        <i @click="showModal = true" class="material-icons toolicon" style="margin-bottom: 0.5rem; margin-right: 0.5rem;" title="Rename">title</i>
        <i class="material-icons toolicon" style="margin-bottom: 0.5rem;" title="Delete">delete</i>
        <div class="sidebar-header">Components</div>
        <div v-for="component in predefinedComponents" v-html="component.preview" class="component" draggable=true v-on:dragend="dropped($event, 0)"></div>
      </div>
    </div>
  </section>
</template>

<script>
import { title, indexOptions } from "~components/config/config";
import * as d3 from "d3";
import axios from '~plugins/axios';
import MyHeader from '~components/Header';
import ModalRename from '~components/modal_rename';

import BasicChart from '../../predefined_components/BasicChart';

export default {
  name: 'dash',
  middleware: ['authentication', 'dashboards'],
  components: {
    MyHeader,
    ModalRename,
  },
  data() {
    return {
      indexOptions,
      components: [],
      predefinedComponents: [
        BasicChart,
      ],
      dragged: null,
      zoomed: null,
      svgOffsetX: 0,
      svgOffsetY: 0,
      clickOffsetX: false,
      clickOffsetY: false,
      showModal: false,
    };
  },
  computed: {
    username() {
      return this.$store.state.authUser;
    },
  },
  methods: {
    setTitle(title) {
      let oldTitle = this.dashboard.title;
      this.dashboard.title = title;
      let body = JSON.stringify({id: this.$route.params.id, title: title});
      fetch(`/api/dashboards/save/title`, {headers: {'Content-Type': 'application/json'}, method: 'POST', body, credentials: 'include'})
        .then(resp => {
          if (resp.status !== 200) {
            this.dashboard.title = oldTitle;
          }
        });
    },
    nothing(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    dropped(e, id) {
      e.preventDefault();
      e.stopPropagation();
      let c = d3.select('.canvas-container');

      let div = c.append('div')
        .attr('class', 'box')
        .style('height', this.predefinedComponents[id].height + 'px')
        .style('width', this.predefinedComponents[id].width + 'px')
        .html(this.predefinedComponents[id].content)
        .attr('offsetX', e.pageX - this.svgOffsetX + (this.predefinedComponents[id].width/2))
        .attr('offsetY', e.offsetY - (this.predefinedComponents[id].height/2) - this.svgOffsetY)
        .attr('uuid', id)
        .style('position', 'absolute')
        .style('transform', `translate(${e.pageX + this.predefinedComponents[id].width/2}px, ${e.offsetY - this.predefinedComponents[id].height/2}px)`)
        .call(d3.drag()
          .on('drag', this.dragged)
          .on('end', () => {
            //dragging = false;
            this.clickOffsetX = false;
            this.clickOffsetY = false;
          })
        );
      let node = div.node();

      let tb = div.append('div')
        .attr('class', 'title-bar')
        .html(`<span>${this.predefinedComponents[id].title}</span>
                <span class="settings-icon material-icons">settings</span>`);

      // tb.node().onclick = (e) => {
      //   console.log(e);
      //   e.stopPropagation();
      // }

          let resizer = document.createElement('div');
          resizer.className = 'resizer';
          node.appendChild(resizer);
          const resize = (e) => {
            if (!e.shiftKey) { return stopResize(e); }
            e.preventDefault();
            e.stopPropagation();
            let newWidth = parseInt(node.style.width) + e.movementX;
            let newHeight = parseInt(node.style.height) + e.movementY;
            let event = new CustomEvent('resized', { detail: { width: newWidth, height: newHeight } });
            node.style.width = newWidth + 'px';
            node.style.height = newHeight + 'px';
            node.dispatchEvent(event);
          }
          const initResize = (e) => {
            if (!e.shiftKey) return;
            e.preventDefault();
            e.stopPropagation();
            document.addEventListener('mousemove', resize, false);
            document.addEventListener('mouseup', stopResize, false);
          }
          const stopResize = (e) => {
            document.removeEventListener('mousemove', resize, false);
            document.removeEventListener('mouseup', stopResize, false);
          }

          resizer.addEventListener('mousedown', initResize, false);

      this.components.push(div);
      eval(this.predefinedComponents[id].script);
      let event = new CustomEvent('created', { detail: { width: this.predefinedComponents[id].width, height: this.predefinedComponents[id].height } });
      node.dispatchEvent(event);
    },
  },
  async asyncData(context) {
    let dashboard = await axios.get(`/data/dashboard/${context.params.id}`);
    context.store.commit('setSelectedDashboard', dashboard.data);
    return {
       dashboard: dashboard.data,
    };
  },
  head() {
    return {
      title: this.dashboard.title,
    };
  },
  mounted() {
    let self = this;
    window.d3 = d3;
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
      meD3.style('transform', styleStr);
      meD3.attr('offsetX', (x - self.svgOffsetX - self.clickOffsetX));
      meD3.attr('offsetY', (y - self.svgOffsetY - self.clickOffsetY));
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
  },
}
</script>

<style lang="scss" scoped>
@import "../../assets/css/main.scss";
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
