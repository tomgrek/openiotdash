export default () => {
return {
  title: 'Map',
  uuid: null,
  content:
  `<div id="map" style="position: absolute; top: 1.5rem; width: calc(100% - 0.5px); height: calc(100% - calc(1.5rem + 0.5px));">

  </div>`,
  preview: `<img style="height:100%; width:100%;" src="/mapcomponent.png"></img>`,
  data: {},
  dataSources: [
  ],
  dataSinks: [
  ],
  defaultSettings: {},
  settings: {
    color: 'darkorchid',
    icon: 'triangle-stroked-15',
  },
  settingsDisplay:
    `<div>My settings for my map
      Icon (e.g. beer-15): <input id="icon" type="text"></input>
      <div>To use this map component: each datapoint needs lat, lng, and val. For example:
      curl http://localhost:3000/d/w/[writeKey]/[sinkName] -X "POST" -v -d "lng=-122.5&lat=37.1&val=22.3"</div>
    </div>`,
  height: 150,
  width: 300,
  transform: '',
  offsetX: 0,
  offsetY: 0,
  scriptLoaded: false,
  styleLoaded: false,
  externalScripts: [
    'https://api.mapbox.com/mapbox-gl-js/v0.39.1/mapbox-gl.js',
  ],
  externalStyles: [
    'https://api.mapbox.com/mapbox-gl-js/v0.39.1/mapbox-gl.css',
  ],
  script: `
            const drawChart = (e) => {
              if (!e) e = { detail: {} };
              for (let key of Object.keys(this.data)) {
                let data = this.data[key].map((x, index) => {
                  let val = JSON.parse(x.data)
                  return {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [parseFloat(val.lng) || 0, parseFloat(val.lat) || 0],
                    },
                    properties: {
                      index,
                      val: val.val || 0,
                    },
                  };
                });
                if (this.map.getSource('points'+key)) this.map.removeSource('points'+key);
                if (this.map.getLayer('points'+key)) this.map.removeLayer('points'+key);

                this.map.addLayer({
                  id: 'points'+key,
                  type: 'symbol',
                  source: {
                    type: 'geojson',
                    data: {
                      type: 'FeatureCollection',
                      features: data,
                    },
                  },
                  layout: {
                    "icon-image": this.settings.icon,
                    "text-field": '{val}',
                    "icon-size": 1.8,
                    "text-offset": [0, this.settings.icon ? -1 : 0],
                  },
                });
              }
            };
            node.addEventListener('dblclick', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('wheel', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('click', e => {
              // console.log(this.settings.myfield);
            });
            node.addEventListener('externalResourceLoaded', e => {
              if (e.detail.type === 'script') {
                this.scriptLoaded = true;
              }
              if (e.detail.type === 'style') {
                this.styleLoaded = true;
              }
              if (!this.styleLoaded || !this.scriptLoaded) {
                return false;
              }
              if (!this.map) {
                mapboxgl.accessToken = 'pk.eyJ1IjoidG9tZ3JlayIsImEiOiJjajcybnp5OGkwMzhvMzNtb2dmeWE2ZWIzIn0.3WV2DSDqOKT_QTunUUpe9A';
                this.map = new mapboxgl.Map({
                  container: 'map',
                  style: 'mapbox://styles/mapbox/streets-v9',
                  center: [-122.44, 37.8],
                  zoom: 9
                });
                this.map.on('load', () => {
                  this.map.boxZoom.disable();
                  this.map.doubleClickZoom.disable();
                  this.map.dragPan.disable();
                  this.map.keyboard.enable();
                  drawChart(e);
                });
              }
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
              let processData = () => {
                if (this.scriptLoaded && this.styleLoaded) {
                  setTimeout(drawChart, 2);
                } else {
                  setTimeout(processData, 10);
                }
              };
              setTimeout(processData, 1);
            });
            node.addEventListener('newData', e => {
              if (e.detail.dataSink) {
                // if same latlng, replace it
                let target = JSON.parse(e.detail.newData.data);
                let replaceOlder = this.data[e.detail.dataSink.title].filter(x => {
                  let y = JSON.parse(x.data);
                  if (y.lat === target.lat && y.lng === target.lng) {
                    return true;
                  }
                  return false;
                });
                if (replaceOlder[0]) {
                  replaceOlder[0].data = JSON.parse(replaceOlder[0].data);
                  replaceOlder[0].data.val = target.val;
                  replaceOlder[0].data = JSON.stringify(replaceOlder[0].data);
                  replaceOlder[0].createdAt = e.detail.newData.createdAt;
                } else {
                  if (this.data[e.detail.dataSink.title].length >= e.detail.dataSink.limit) {
                    this.data[e.detail.dataSink.title].shift();
                  }
                  this.data[e.detail.dataSink.title].push(e.detail.newData);
                }
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
              styleNode.id = 'style-'+this.uuid;
              document.body.appendChild(styleNode);
              this.styleLoaded = false;
              this.scriptLoaded = false;
            });
            node.addEventListener('resized', (e) => {
              let ctr = this.map.getCenter();
              let zm = this.map.getZoom();
              let existingMap = document.getElementById('map');
              for (let child of existingMap.children) {
                child.remove();
              }
              this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v9',
                center: ctr,
                zoom: zm,
              });
              this.map.on('load', () => {
                this.map.boxZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.dragPan.disable();
                this.map.keyboard.enable();
                drawChart(e);
              });
            });
            node.addEventListener('settingsChanged', (e) => {
              drawChart(e);
            });
            node.addEventListener('beforeSave', e => {
              delete this.map;
              this.styleLoaded = false;
              this.scriptLoaded = false;
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
