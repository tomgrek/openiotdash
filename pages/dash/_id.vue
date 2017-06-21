<template>
  <section class="container">
    <my-header :username="username"/>
    <h1 class="title">{{this.$router.currentRoute.params.id}}
      {{dashboard.title}}
    </h1>
    <div v-once class="canvas-container">
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
    };
  },
  computed: {
    username() {
      return this.$store.state.authUser;
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

    var d = c.append('div')
      .attr('class', 'box')
      .style('transform', 'translate(0px, 0px)')
      .call(d3.drag()
        .on('drag', dragged)
        .on('end', () => {
          //dragging = false;
        })
      );
    let offsetX = 0;
    let offsetY = 0;
    let svgOffsetY = 0;
    let svgOffsetX = 0;

    let zoom = d3.zoom()
        .scaleExtent([1, 24])
        .translateExtent([[-c_node.clientWidth, -c_node.clientHeight], [c_node.clientWidth*2, c_node.clientHeight*2]])
        .on("zoom", zoomed);

    c.call(zoom);
    //svg.call(zoom);

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
      d3.select(this).style('transform', styleStr);
      offsetX = (x - svgOffsetX - 40);
      offsetY = (y - svgOffsetY - 40);
    }

    function zoomed() {
      let transform = d3.event.transform;
      let boxTransform = Math.pow(transform.k, 4);
      d.style("transform", "translate(" + (transform.x + offsetX) + "px, " + (transform.y + offsetY) + "px) scale(" + (boxTransform) + ")");
      d.style("box-shadow", `${(boxTransform-1)*10}px ${(boxTransform-1)*10}px ${(boxTransform-1)*10}px lightgray`);
      svg.attr("transform", "translate(" + transform.x + ", " + transform.y + ") scale(" + transform.k + ")");
      svgOffsetY = transform.y;
      svgOffsetX = transform.x;
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
.canvas-container {
  overflow: hidden;
  border: 1px solid black;
  height: 80vh;
  opacity: 0.9;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  width: 90vw;
  text-align: left;
}
.axis line {
  fill: none;
  stroke: #ddd;
  shape-rendering: crispEdges;
  vector-effect: non-scaling-stroke;
}
</style>
