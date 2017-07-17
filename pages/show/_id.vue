<template>
  <section class="container">
    <my-header :username="username" :extended="dashboard.title"/>
    <div class="main-container">
      <div id="canvasContainer"></div>
      <div v-once class="canvas-container" v-on:dragover="nothing($event)" v-on:drop="nothing($event)">
      </div>
    </div>
  </section>
</template>

<script>
import { title, indexOptions } from "~components/config/config";
import * as d3 from "d3";
import axios from '~plugins/axios';
import { getUuid } from '~plugins/utils';
import MyHeader from '~components/Header';

import BasicChart from '../../predefined_components/BasicChart';
import Tester from '../../predefined_components/Tester';

import fakedrop from '../../clientutils/utils';

export default {
  name: 'dash',
  middleware: ['authentication', 'dashboards'],
  components: {
    MyHeader,
  },
  data() {
    return {
      indexOptions,
      components: [],
      predefinedComponents: [
        BasicChart,
        Tester,
      ],
      individualComponents: [],
      zoomed: null,
      svgOffsetX: 0,
      svgOffsetY: 0,
      clickOffsetX: false,
      clickOffsetY: false,
      selectedComponent: null,
    };
  },
  watch: {
  },
  computed: {
    username() {
      return this.$store.state.authUser;
    },
  },
  methods: {
    nothing(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    fakeDrop(fullComponent) {
      fakedrop(fullComponent, this);
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
    for (let component of def.components) {
      this.fakeDrop(component);
    }
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
.canvas-container {
  overflow: hidden;
  height: 100%;
  opacity: 0.9;
  position: relative;
  width: calc(100%);
  text-align: left;
  display: inline-block;
}
</style>
