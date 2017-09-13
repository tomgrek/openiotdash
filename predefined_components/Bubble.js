export default () => {
return {
  title: 'Bubble',
  uuid: null,
  content:
  `<div id="bubble" style="position: absolute; top: 1.5rem; width: calc(100% - 0.5px); height: calc(100% - calc(1.5rem + 0.5px));">
    <canvas id="bubbleCanvas" style="height: 100%; width: 100%;">
    </canvas>
  </div>`,
  preview: `<img style="height:100%; width:100%;" src="https://upload.wikimedia.org/wikipedia/commons/1/10/Bubble_shot_%282443185091%29.jpg"></img>`,
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
    `<div>My settings for my bubble
    </div>`,
  height: 150,
  width: 300,
  transform: '',
  offsetX: 0,
  offsetY: 0,
  script: `
            const drawChart = (e) => {
              if (!e) e = { detail: {} };

            };
            node.addEventListener('dblclick', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('click', e => {
              // console.log(this.settings.myfield);
            });
            node.addEventListener('data', e => {
              let uniqueByKey = {};
              let uniques = {};
              for (let key of Object.keys(e.detail)) {
                e.detail[key].map(x => {
                  let y = JSON.parse(x.data);
                  uniques[key + y.lat + y.lng] = x;
                });
                uniqueByKey[key] = Object.keys(uniques).map(x => uniques[x]);
              }
              Object.assign(this.data, uniqueByKey);
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
              // if (e.target.id === 'myfield') {
              //   this.settings.myfield = e.target.value;
              // }
            });
            node.addEventListener('created', e => {
              this.uuid = e.detail.uuid;
              // add css for the component
              let styleNode = document.createElement('style');
              let styleFactory = new Function('uuid', this.style);
              styleNode.innerHTML = styleFactory(this.uuid);
              styleNode.id = 'style-'+this.uuid;
              document.body.appendChild(styleNode);
            });
            node.addEventListener('resized', (e) => {
            });
            node.addEventListener('settingsChanged', (e) => {
              drawChart(e);
            });
            node.addEventListener('beforeSave', e => {
            });
            node.addEventListener('deleted', (e) => {
            });
            node.addEventListener('moved', (e) => {
              this.transform = e.detail.transform;
              this.offsetX = e.detail.offsetX;
              this.offsetY = e.detail.offsetY;
            });
          `,
  style: `return '#'+uuid+' {  }' `,
  }
}
