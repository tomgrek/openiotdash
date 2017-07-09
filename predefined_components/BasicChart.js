export default () => {
return {
  title: 'comp1',
  uuid: null,
  content: `<div style="position: absolute;"></div>`,
  preview: `<span>Basic Line Chart</span>`,
  defaultSettings: {},
  settings: {},
  settingsDisplay:
    `<div>My settings for my component
      <input id="title" type="text"></input>
    </div>`,
  height: 100,
  width: 200,
  transform: '',
  offsetX: 0,
  offsetY: 0,
  script: `
            console.log(this, node);
            const draw = e => {
              node.children[0].innerHTML = '';
              let svg = d3.select(node.children[0]).append("svg")

              let height = e.detail.height;
              let width = e.detail.width;
              svg.attr("height", height);
              svg.attr("width", width);
              var x = d3.scaleTime().range([0, width]);

              var y = d3.scaleLinear().range([0, height]);
              let g = svg.append("g");
              var parseTime = d3.timeParse("%d-%b-%y");
              var line = d3.line()
              .x(function(d) { return x(d.date); })
              .y(function(d) { return y(d.close); });

              d3.tsv("/data.tsv", function(d) {
                d.date = parseTime(d.date);
                d.close = +d.close;
                return d;
              }, function(error, data) {
                if (error) throw error;
                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain([0, d3.max(data, function(d) { return d.close; })]);

                g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);
              });
            };
            node.addEventListener('created', e => {
              this.uuid = e.detail.uuid;
              draw(e);
            });
            node.addEventListener('resized', (e) => {
              this.height = e.detail.height;
              this.width = e.detail.width;
              draw(e);
            });
            node.addEventListener('settings', (e) => {
              console.log(e, this.height, this.width, this.uuid, this.offsetX);
            });
            node.addEventListener('moved', (e) => {
              this.transform = e.detail.transform;
              this.offsetX = e.detail.offsetX;
              this.offsetY = e.detail.offsetY;
            });
          `,
}
}
