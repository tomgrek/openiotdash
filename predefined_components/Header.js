export default () => {
return {
  title: 'Header',
  uuid: null,
  content:
  `<div style="position: absolute; top: 1.5rem;">
    <h1 id="texttodisplay"></h1>
  </div>`,
  preview: `<img style="height:100%; width:100%;" src="/header.png"></img>`,
  data: {},
  dataSources: [],
  dataSinks: [],
  defaultSettings: {},
  settings: {
    texttodisplay: 'Default Text',
  },
  settingsDisplay:
    `<div>
      <p>Settings for my header component<p>
      <p>Nothing useful here -- just a basic component that displays text.</p>
      <div>Set the titlebar title: <input id="title" type="text"></input></div>
      <div>And the text: <input id="texttodisplay" type="text"></input></div>
    </div>`,
  height: 100,
  width: 200,
  transform: '',
  offsetX: 0,
  offsetY: 0,
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
              } else {
                svg = this.settings.svg;

                if (svg.attr('height') != height || svg.attr('width') != width) {
                  node.children[0].innerHTML = '';
                  svg = d3.select(node.children[0]).append("svg");
                  svg.attr("height", height);
                  svg.attr("width", width);
                  this.settings.svg = svg;
                }
              }
              svg.selectAll('text').remove();
              svg.selectAll('text')
                .data([this.settings.texttodisplay])
                .enter().append('text')
                .attr("x", width/2)
                .attr("y", height/2)
                .text(d => d)
                .attr('font-family', 'Roboto Slab, sans-serif')
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr("font-size", (1.5*width/this.settings.texttodisplay.length)+'px');
            };
            node.addEventListener('dblclick', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('created', e => {
              this.uuid = e.detail.uuid;
              let styleNode = document.createElement('style');
              let styleFactory = new Function('uuid', this.style);
              styleNode.innerHTML = styleFactory(this.uuid);
              styleNode.id = 'style-'+this.uuid;
              document.body.appendChild(styleNode);
              drawChart(e);
            });
            node.addEventListener('resized', (e) => {
              drawChart(e);
            });
            node.addEventListener('settingsChanged', (e) => {
              drawChart(e);
            });
            node.addEventListener('moved', (e) => {
              this.transform = e.detail.transform;
              this.offsetX = e.detail.offsetX;
              this.offsetY = e.detail.offsetY;
            });
          `,
  style: `return '#'+uuid+' { color: red; stroke-width: 3px; }' `,
  // TODO: Styling is a bit broken, mainly due to the ordering of the '`"
  }
}
