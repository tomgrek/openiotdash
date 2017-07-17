import { getUuid } from '~plugins/utils';

export default (fullComponent, self, editing = false) => {

    let comp = fullComponent.component;
    let c = d3.select('.canvas-container');
    let uuid = getUuid();
    let div = c.append('div')
      .attr('class', 'box')
      .style('height', comp.height + 'px')
      .style('width', comp.width + 'px')
      .html(comp.content)
      .attr('offsetX', comp.offsetX - self.svgOffsetX)
      .attr('offsetY', comp.offsetY - self.svgOffsetY)
      .attr('uuid', uuid)
      .style('position', 'absolute')
      .style('transform', `translate(${comp.offsetX}px, ${comp.offsetY}px)`)
      .call(d3.drag()
        .on('drag', self.dragged)
        .on('end', () => {
          //dragging = false;
          self.clickOffsetX = false;
          self.clickOffsetY = false;
        })
      );
    fullComponent.node = div.node();
    let tb = div.append('div')
      .attr('class', 'title-bar')
      .html(`<span id="componentTitle-${uuid}">${comp.title}</span>`);

    self.components.push(div);

    let keyQueries = [];
    for (let sink of comp.dataSinks) {
      keyQueries.push(fetch('/api/datasinks/getReadKey/'+sink.id, {credentials: 'include'}).then(r => r.json()));
    }
    self.individualComponents.push({uuid, component: comp, node: fullComponent.node});
    let node = fullComponent.node;
    (() => { eval(comp.script) }).call(comp);
    let createdEvent = new CustomEvent('created', { detail: { uuid, width: comp.width, height: comp.height } });
    fullComponent.node.dispatchEvent(createdEvent);

    Promise.all(keyQueries).then(keys => {
      let dataQueries = [];
      for (let key in keys) {
        dataQueries.push(fetch(`/d/r/${keys[key].readKey}/${comp.dataSinks[key].id}`, {credentials: 'include'}).then(r => r.json()));
      }
      Promise.all(dataQueries).then(data => {
        let detail = {};
        for (let key in keys) {
          detail[keys[key].title] = data[key];
        }
        let dataEvent = new CustomEvent('data', { detail });
        fullComponent.node.dispatchEvent(dataEvent);
      });
    });
    if (editing) {
      let tb = node.querySelector(`.title-bar`);
      let settingsIcon = document.createElement('span');
      settingsIcon.className = 'settings-icon material-icons';
      settingsIcon.innerText = 'settings';
      settingsIcon.onclick = window.showSettings.bind(self, uuid);
      tb.append(settingsIcon);
      let resizer = document.createElement('div');
      resizer.className = 'resizer';
      node.appendChild(resizer);
      const resize = (e) => {
        if (!e.shiftKey) { return stopResize(e); }
        e.preventDefault();
        e.stopPropagation();
        let newWidth = parseInt(node.style.width) + e.movementX;
        let newHeight = parseInt(node.style.height) + e.movementY;
        let event = new CustomEvent('resized', { detail: { width: newWidth, height: newHeight } });
        node.style.width = newWidth + 'px';
        node.style.height = newHeight + 'px';
        fullComponent.component.width = newWidth;
        fullComponent.component.height = newHeight;
        node.dispatchEvent(event);
      }
      const initResize = (e) => {
        if (!e.shiftKey) return;
        e.preventDefault();
        e.stopPropagation();
        document.addEventListener('mousemove', resize, false);
        document.addEventListener('mouseup', stopResize, false);
      }
      const stopResize = (e) => {
        document.removeEventListener('mousemove', resize, false);
        document.removeEventListener('mouseup', stopResize, false);
      }
      resizer.addEventListener('mousedown', initResize, false);

    }
    return fullComponent;
};
