<template>
  <section class="container">
    <my-header :username="username" :extended="dashboard.title"/>
    <div class="main-container">
      <div v-once class="canvas-container" v-on:dragover="nothing($event)" v-on:drop="nothing($event)">
      </div>
      <div class="sidebar">
        <div class="sidebar-header">Components</div>
        <div class="component" draggable=true v-on:dragend="dropped($event)"></div>
      </div>
    </div>
  </section>
</template>

<script>
import { title, indexOptions } from "~components/config/config";
import * as d3 from "d3";
import axios from '~plugins/axios';
import MyHeader from '~components/Header.vue';

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
      dragged: null,
      zoomed: null,
    };
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
      console.log(e);
    },
    dropped(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log(e);
      let c = d3.select('.canvas-container');
      let c_node = c.node();
      this.components.push(c.append('div')
        .attr('class', 'box')
        .attr('offsetX', e.pageX)
        .attr('offsetY', e.offsetY - 80)
        .style('transform', `translate(${e.pageX}px, ${e.offsetY - 80}px)`)
        .call(d3.drag()
          .on('drag', this.dragged)
          .on('end', () => {
            //dragging = false;
          })
        ));
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
      title,
    };
  },
  mounted() {
    const margin = {top: -5, right: -5, bottom: -5, left: -5};
    let bbox = document.getElementsByClassName('canvas-container')[0].getBoundingClientRect();
    const width = parseInt(bbox.width) - 4;
    const height = parseInt(bbox.height) - 4;
    let svg = d3.select(".canvas-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", "2px")
        .style("left", "2px")
        .style("z-index", "-1")
        .style("transform", "translateZ(0)")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")");
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

    this.components.push(c.append('div')
      .attr('class', 'box')
      .attr('offsetX', 0)
      .attr('offsetY', 0)
      .style('transform', 'translate(0px, 0px)')
      .call(d3.drag()
        .on('drag', dragged)
        .on('end', () => {
          //dragging = false;
        })
      ));

    this.components.push(c.append('div')
      .attr('class', 'box')
      .attr('offsetX', 100)
      .attr('offsetY', 100)
      .style('transform', 'translate(100px, 100px)')
      .call(d3.drag()
        .on('drag', dragged)
        .on('end', () => {
          //dragging = false;
        })
    ));

    let svgOffsetY = 0;
    let svgOffsetX = 0;

    function dragged(d) {
      d3.event.sourceEvent.stopPropagation();

      let x = d3.event.x;
      let y = d3.event.y;

      let style = d3.select(this).style('transform');
      let st = style.match(/scale\((.*)\)/i);

      if (x < (svgOffsetX+40)) return;
      if (x + 40 > width + svgOffsetX) return;
      if (y < (svgOffsetY+40)) return;
      if (y + 40 > height + svgOffsetY) return;

      let styleStr = 'translate(' + (x - 40) + 'px, ' + (y - 40) + 'px)';
      if (st !== null && st[1]) {
        styleStr = styleStr + ' scale(' + parseFloat(st[1]) + ')';
      }
      let meD3 = d3.select(this);
      meD3.style('transform', styleStr);
      meD3.attr('offsetX', (x - svgOffsetX - 40));
      meD3.attr('offsetY', (y - svgOffsetY - 40));
    }
    this.dragged = dragged;

    const zoomed = () => {
      let transform = d3.event.transform;
      let boxTransform = Math.pow(transform.k, 4);
      //console.log(parseFloat(d.attr('offsetX')) + parseFloat(transform.x), d.attr('offsetY'));
      for (var selection of this.components) {
        selection.style("transform", "translate(" + (transform.x + parseFloat(selection.attr('offsetX')) ) + "px, " + (transform.y + parseFloat(selection.attr('offsetY'))) + "px) scale(" + (boxTransform) + ")");
        selection.style("box-shadow", `${(boxTransform-1)*10}px ${(boxTransform-1)*10}px ${(boxTransform-1)*10}px lightgray`);
      }
      svg.attr("transform", "translate(" + transform.x + ", " + transform.y + ") scale(" + transform.k + ")");
      svgOffsetY = transform.y;
      svgOffsetX = transform.x;
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
}
.sidebar {
  width: 20%;
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
  width: 80%;
  text-align: left;
  display: inline-block;
}
</style>
