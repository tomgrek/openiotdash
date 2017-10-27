export default () => {
return {
  title: 'SparkLine',
  uuid: null,
  content:
  `<div style="position: absolute; top: 1.5rem;">

  </div>`,
  preview: `<img style="height:100%; width:100%;" src="https://upload.wikimedia.org/wikipedia/commons/6/6d/FTSE_100_index_chart_since_1984.png"></img>`,
  data: {},
  dataSources: [
  ],
  dataSinks: [
  ],
  defaultSettings: {},
  settings: {
    color: 'darkorchid',
  },
  settingsDisplay:
    `<div>My settings for my chart component
      <input id="title" type="text"></input>
      <div><span>Color: </span><input id="color" type="text"></input></div>
    </div>`,
  height: 100,
  width: 200,
  transform: '',
  offsetX: 0,
  offsetY: 0,
  script: `
            const drawChart = (e) => {
              if (!e) e = { detail: {} };
              node.children[0].innerHTML = '';
              let svg = d3.select(node.children[0]).append("svg");
              let height = (e.detail.height || this.height) - 24; // 24=1.5rem=title bar
              let width = e.detail.width || this.width;
              svg.attr("height", height);
              svg.attr("width", width);
              var x = d3.scaleLinear().range([0, width]);
              var y = d3.scaleLinear().range([0, height]);
              let g = svg.append("g");
              var line = d3.line()
                .x(function(d) { return x(d.index); })
                .y(function(d) { return y(d.val); });
              for (let key of Object.keys(this.data)) {
                let data = this.data[key].map((x, index) => {
                  let val = JSON.parse(x.data)
                  return { index, val: parseFloat(val.value) || 0 };
                });
                x.domain(d3.extent(data, function(d) { return d.index; }));
                y.domain([d3.max(data, function(d) { return d.val; }), 0]);
                g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", this.settings.color)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);
              }
            };
            node.addEventListener('dblclick', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('click', e => {
              // console.log(this.settings.myfield);
            });
            node.addEventListener('data', e => {
              Object.assign(this.data, e.detail);
              drawChart(e);
              //node.querySelector('#latestData').innerText = JSON.parse(this.data.j4xbpkli[5].data).value;
            });
            node.addEventListener('newData', e => {
              if (e.detail.dataSink) {
                if (this.data[e.detail.dataSink.title].length >= e.detail.dataSink.limit) {
                  this.data[e.detail.dataSink.title].shift();
                }
                this.data[e.detail.dataSink.title].push(e.detail.newData);
              } else {
                let assignObj = {};
                assignObj[e.detail.dataSource.title] = e.detail.newData;
                Object.assign(this.data, assignObj);
              }
              drawChart();
            });
            node.addEventListener('input', e => {
              if (e.target.id === 'myfield') {
                this.settings.myfield = e.target.value;
              }
            });
            node.addEventListener('created', e => {
              this.uuid = e.detail.uuid;
              // add css for the component
              let styleNode = document.createElement('style');
              let styleFactory = new Function('uuid', this.style);
              styleNode.innerHTML = styleFactory(this.uuid);
              // console.log(styleNode.innerHTML);
              styleNode.id = 'style-'+this.uuid;
              document.body.appendChild(styleNode);
              // drawChart(e);
            });
            node.addEventListener('resized', (e) => {
              drawChart(e);
            });
            node.addEventListener('settingsChanged', (e) => {
              drawChart(e);
            });
            node.addEventListener('deleted', (e) => {
            });
            node.addEventListener('moved', (e) => {
              this.transform = e.detail.transform;
              this.offsetX = e.detail.offsetX;
              this.offsetY = e.detail.offsetY;
            });
          `,
  style: `return '#'+uuid+' { color: red; stroke-width: 23px;  }' `,
  // TODO: Styling is a bit broken, mainly due to the ordering of the '`"
  }
}
