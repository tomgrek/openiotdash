export default () => {
return {
  title: 'testcomp',
  uuid: null,
  content:
  `<div style="position: absolute; top:1.5rem;">
    <button>Say hi</button>
    <input id="myfield" type="text"></input>
    <span id="latestData">?</span>
  </div>`,
  preview: `<span>Test component</span>`,
  data: {},
  dataSources: [],
  dataSinks: [
    { id: 1, title: 'j4xbpkli', url: '' },
    { id: 5, title: 'j51rvm9y', url: '' },
  ],
  defaultSettings: {},
  settings: {},
  settingsDisplay:
    `<div>My settings for my test component
      <input id="title" type="text"></input>
    </div>`,
  height: 150,
  width: 200,
  transform: '',
  offsetX: 0,
  offsetY: 0,
  script: `
            node.addEventListener('dblclick', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('click', e => {
              console.log(this.settings.myfield);
              console.log(this.offsetX);
            });
            node.addEventListener('data', e => {
              console.log(this.data, e.detail);
              Object.assign(this.data, e.detail);
              node.querySelector('#latestData').innerText = JSON.parse(this.data.j4xbpkli[5].data).value;
            });
            node.addEventListener('input', e => {
              if (e.target.id === 'myfield') {
                this.settings.myfield = e.target.value;
              }
            });
            node.addEventListener('created', e => {
              this.uuid = e.detail.uuid;
            });
            node.addEventListener('resized', (e) => {
            });
            node.addEventListener('settings', (e) => {
            });
            node.addEventListener('moved', (e) => {
              this.transform = e.detail.transform;
              this.offsetX = e.detail.offsetX;
              this.offsetY = e.detail.offsetY;
            });
          `,
  style: () => ``,
  }
}
