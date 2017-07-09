export default () => {
return {
  title: 'testcomp',
  uuid: null,
  content:
  `<div style="position: absolute;">
    <button>Say hi</button>
    <input id="myfield" type="text"></input>
  </div>`,
  preview: `<span>Test component</span>`,
  data: {},
  defaultSettings: {},
  settings: {},
  settingsDisplay:
    `<div>My settings for my test component
      <input id="title" type="text"></input>
    </div>`,
  height: 100,
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
              console.log(this.data.myfield);
            });
            node.addEventListener('input', e => {
              if (e.target.id === 'myfield') {
                this.data.myfield = e.target.value;
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
  }
}
