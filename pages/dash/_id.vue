<template>
  <section class="container">
    <my-header :username="username" :extended="dashboard.title"/>
    <div class="main-container">
      <div v-once class="canvas-container" v-on:dragover="nothing($event)" v-on:drop="nothing($event)">
      </div>
      <div class="sidebar">
        <div class="sidebar-header">Components</div>
        <div class="component" draggable=true v-on:dragend="dropped($event, 0)"></div>
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
      predefinedComponents: [
        {
          title: 'comp1',
          content: `<div id="tom" style="position: absolute;"></div>`,
          script: `

                    let margin = {top: 0, right: 0, bottom: 0, left: 0};
                    // let svg = d3.select(document.querySelector("#tom")).append("svg")

                    // setInterval(() => {
                    //   document.querySelector('#tom').innerHTML = '';
                    //
                    //   let svg = d3.select(document.querySelector("#tom")).append("svg")
                    //
                    //   let height = document.querySelector("#tom").parentElement.getBoundingClientRect().height - 16;
                    //   let width = document.querySelector("#tom").parentElement.getBoundingClientRect().width - 16;
                    //   svg.attr("height", height);
                    //   svg.attr("width", width);
                    //   var x = d3.scaleTime().range([0, width]);
                    //
                    //   var y = d3.scaleLinear().range([0, height]);
                    //   let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    //   var parseTime = d3.timeParse("%d-%b-%y");
                    //   var line = d3.line()
                    //   .x(function(d) { return x(d.date); })
                    //   .y(function(d) { return y(d.close); });
                    //
                    //   d3.tsv("/data.tsv", function(d) {
                    //     d.date = parseTime(d.date);
                    //     d.close = +d.close;
                    //     return d;
                    //   }, function(error, data) {
                    //     if (error) throw error;
                    //
                    //     // x.domain(d3.extent(data, function(d) { return d.date; }));
                    //     // y.domain(d3.extent(data, function(d) { return d.close; }));
                    //     x.domain(d3.extent(data, function(d) { return d.date; }));
                    //     y.domain([0, d3.max(data, function(d) { return d.close; })]);
                    //
                    //     // g.append("g")
                    //     //     .attr("transform", "translate(0," + 80 + ")")
                    //     //     .call(d3.axisBottom(x))
                    //     //   .select(".domain")
                    //     //     .remove();
                    //     //
                    //     // g.append("g")
                    //     //     .call(d3.axisLeft(y))
                    //     //   .append("text")
                    //     //     .attr("fill", "#000")
                    //     //     .attr("transform", "rotate(-90)")
                    //     //     .attr("y", 6)
                    //     //     .attr("dy", "0.71em")
                    //     //     .attr("text-anchor", "end")
                    //     //     .text("Price ($)");
                    //
                    //     g.append("path")
                    //         .datum(data)
                    //         .attr("fill", "none")
                    //         .attr("stroke", "steelblue")
                    //         .attr("stroke-linejoin", "round")
                    //         .attr("stroke-linecap", "round")
                    //         .attr("stroke-width", 1.5)
                    //         .attr("d", line);
                    //   });
                    //
                    // }, 1000);


                    `,
        },
      ],
      dragged: null,
      zoomed: null,
      svgOffsetX: 0,
      svgOffsetY: 0,
      clickOffsetX: false,
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
    },
    dropped(e, id) {
      e.preventDefault();
      e.stopPropagation();
      let c = d3.select('.canvas-container');

      let div = c.append('div')
        .attr('class', 'box')
        .html(this.predefinedComponents[id].content)
        .attr('offsetX', e.pageX - this.svgOffsetX)
        .attr('offsetY', e.offsetY - 80 - this.svgOffsetY)
        .style('position', 'absolute')
        .style('transform', `translate(${e.pageX - 15}px, ${e.offsetY - 80}px)`)
        .call(d3.drag()
          .on('drag', this.dragged)
          .on('end', () => {
            //dragging = false;
            this.clickOffsetX = false;
            this.clickOffsetY = false;
          })
        );


      let tb = div.append('div')
        .attr('class', 'title-bar')
      tb.node().onclick = (e) => {
        console.log(e);
        e.stopPropagation();
      }

          var resizer = document.createElement('div');
          resizer.className = 'resizer';
          resizer.style.width = '10px';
          resizer.style.height = '10px';
          resizer.style.background = 'red';
          resizer.style.position = 'absolute';
          resizer.style.visibility = 'hidden';
          resizer.style.right = 0;
          resizer.style.bottom = 0;
          resizer.style.cursor = 'se-resize';
          let node = div.node();
          node.appendChild(resizer);
          function Resize(e) {
            if (!e.shiftKey) { return stopResize(e); }
            //if (e.target !== div.node()) return;
            e.preventDefault();
            e.stopPropagation();
             node.style.width = (e.clientX - parseInt(node.getAttribute('offsetX'))) + 'px';
             node.style.height = (e.clientY - parseInt(node.getAttribute('offsetY')) - 40) + 'px';
          }

          function initResize(e) {
            if (!e.shiftKey) return;
            e.preventDefault();
            e.stopPropagation();
             document.addEventListener('mousemove', Resize, false);
             document.addEventListener('mouseup', stopResize, false);
          }
          function stopResize(e) {
              document.removeEventListener('mousemove', Resize, false);
              document.removeEventListener('mouseup', stopResize, false);
          }


          resizer.addEventListener('mousedown', initResize, false);

      this.components.push(div);
      eval(this.predefinedComponents[id].script);
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
    var self = this;
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

    function dragged() {
      let elm = this;
      //if (d3.event.sourceEvent.target.className !== 'title-bar') elm = this.parentElement;
      if (d3.event.sourceEvent.shiftKey) return;
      d3.event.sourceEvent.stopPropagation();
      if (d3.event.sourceEvent.target.className !== 'title-bar') return;

      let x = d3.event.x;
      let y = d3.event.y;

      let style = d3.select(elm).style('transform');
      let st = style.match(/scale\((.*)\)/i);

      if (x < (self.svgOffsetX+40)) return;
      if (x + 40 > width + self.svgOffsetX) return;
      if (y < (self.svgOffsetY+40)) return;
      if (y + 40 > height + self.svgOffsetY) return;


      let smaller = parseInt(style.split(',')[0].split('(')[1]);
      let smallerY = parseInt(style.split(',')[1].split(')')[0]);

      if (!this.clickOffsetX) this.clickOffsetX = x - smaller;
      if (!this.clickOffsetY) this.clickOffsetY = y - smallerY;
      let styleStr = 'translate(' + (x - this.clickOffsetX) + 'px, ' + (y - this.clickOffsetY) + 'px)';
      if (st !== null && st[1]) {
        styleStr = styleStr + ' scale(' + parseFloat(st[1]) + ')';
      }
      let meD3 = d3.select(elm);
      meD3.style('transform', styleStr);
      meD3.attr('offsetX', (x + this.clickOffsetX - self.svgOffsetX));
      meD3.attr('offsetY', (y - this.clickOffsetY - self.svgOffsetY));
    }
    this.dragged = dragged;

    const zoomed = () => {
      let transform = d3.event.transform;
      let boxTransform = Math.pow(transform.k, 3);
      for (let selection of this.components) {
        selection.style("transform", "translate(" + (transform.x + parseFloat(selection.attr('offsetX')) ) + "px, " + (transform.y + parseFloat(selection.attr('offsetY'))) + "px) scale(" + (boxTransform) + ")");
        selection.style("box-shadow", `${(boxTransform-1)*10}px ${(boxTransform-1)*10}px ${(boxTransform-1)*10}px lightgray`);
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
