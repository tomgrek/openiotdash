export default () => {
return {
  title: 'Happy Bubble',
  uuid: null,
  content:
  `<div style="position: absolute; top: 1.5rem;">

  </div>`,
  preview: `<img style="height:100%; width:100%;" src="https://placehold.it/200x100"></img>`,
  data: {},
  dataSources: [],
  dataSinks: [
    { id: 1, title: 'j4xbpkli', url: '', orderBy: 'createdAt DESC', limit: 1 },
  ],
  defaultSettings: {},
  settings: {},
  settingsDisplay:
    `<div>My settings for my bubble component
      <input id="title" type="text"></input>
    </div>`,
  height: 100,
  width: 200,
  transform: '',
  offsetX: 0,
  offsetY: 0, //TODO: Next: Can animate, not redraw the SVG each time.
  script: `
            const drawChart = (e) => {
              if (!e) e = { detail: {} };
              let height = (e.detail.height || this.height) - 24; // 24=1.5rem=title bar
              let width = e.detail.width || this.width;
              let svg;
              if (!node.children[0].querySelector('svg')) {
                node.children[0].innerHTML = '';
                svg = d3.select(node.children[0]).append("svg");
                svg.attr("height", height);
                svg.attr("width", width);
                this.settings.svg = svg;
                this.settings.circle = svg.selectAll('circle').data(this.data.j4xbpkli).enter().append('circle')
                  .attr("cx", width/2)
                  .attr("cy", height/2)
                  .attr("r", d => {
                    return parseInt(JSON.parse(d.data).value);
                  });
              } else {
                svg = this.settings.svg;
                if (svg.attr('height') != height || svg.attr('width') != width) {
                  node.children[0].innerHTML = '';
                  svg = d3.select(node.children[0]).append("svg");
                  svg.attr("height", height);
                  svg.attr("width", width);
                  this.settings.svg = svg;
                  this.settings.circle = svg.selectAll('circle').data(this.data.j4xbpkli).enter().append('circle')
                    .attr("cx", width/2)
                    .attr("cy", height/2)
                    .attr("r", d => {
                      return parseInt(JSON.parse(d.data).value);
                    });
                }
                // this is the same chart!
                this.settings.circle = svg.selectAll('circle').data(this.data.j4xbpkli).transition()
                  .attr("r", d => {
                    return parseInt(JSON.parse(d.data).value);
                  });
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
              if (this.data[e.detail.dataSink.title].length >= e.detail.dataSink.limit) {
                this.data[e.detail.dataSink.title].shift();
              }
              this.data[e.detail.dataSink.title].push(e.detail.newData);
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
            });
            node.addEventListener('deleted', (e) => {
            });
            node.addEventListener('moved', (e) => {
              this.transform = e.detail.transform;
              this.offsetX = e.detail.offsetX;
              this.offsetY = e.detail.offsetY;
            });
          `,
  style: `return '.'+uuid+' { color: red; stroke-width: 3px; }' `,
  // TODO: Styling is a bit broken, mainly due to the ordering of the '`"
  }
}
