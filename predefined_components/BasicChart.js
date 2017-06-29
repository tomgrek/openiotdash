export default {
  title: 'comp1',
  content: `<div style="position: absolute;"></div>`,
  preview: `<span>Basic Line Chart</span>`,
  height: 100,
  width: 200,
  script: `
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
              draw(e);
            });
            node.addEventListener('resized', (e) => {
              draw(e);
            });
          `,
}
