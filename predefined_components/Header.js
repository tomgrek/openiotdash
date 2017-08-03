export default () => {
return {
  title: 'Header',
  uuid: null,
  content:
  `<div style="position: absolute; top: 1.5rem;">
    <h1 id="texttodisplay"></h1>
  </div>`,
  preview: `<img style="height:100%; width:100%;" src="https://placehold.it/200x100"></img>`,
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
  offsetY: 0, //TODO: Next: Can animate, not redraw the SVG each time.
  script: `
            node.addEventListener('dblclick', e => {
              e.preventDefault();
              e.stopPropagation();
            });
            node.addEventListener('created', e => {
              this.uuid = e.detail.uuid;
              // add css for the component
              let styleNode = document.createElement('style');
              let styleFactory = new Function('uuid', this.style);
              styleNode.innerHTML = styleFactory(this.uuid);
              styleNode.id = 'style-'+this.uuid;
              document.body.appendChild(styleNode);
              e.target.querySelector('#texttodisplay').innerText = this.settings.texttodisplay;
            });
            node.addEventListener('settingsChanged', (e) => {
              e.target.querySelector('#texttodisplay').innerText = this.settings.texttodisplay;
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
