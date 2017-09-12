import { getUuid } from '~/plugins/utils';

export default (fullComponent, self, editing = false, isMobile = false) => {

    let comp = fullComponent.component;
    let c = d3.select('.canvas-container');
    let uuid = getUuid();
    let div = c.append('div')
      .attr('class', isMobile ? 'box-mobile' : 'box')
      .style('height', comp.height + 'px')
      .style('width', isMobile ? 'calc(100% - 4px)' : comp.width + 'px')
      .html(comp.content)
      .attr('offsetX', isMobile ? 0 : (parseInt(comp.offsetX) || 0))
      .attr('offsetY', isMobile ? 0 : (parseInt(comp.offsetY) || 0))
      .attr('uuid', uuid)
      .attr('id', uuid)
      .style('position', isMobile ? 'relative' : 'absolute')
      .style('transform', `translate(${isMobile ? 0 : comp.offsetX}px, ${isMobile ? 0 : comp.offsetY}px)`);
    if (!isMobile) {
      div.call(d3.drag()
        .on('drag', self.dragged)
        .on('end', () => {
          //dragging = false;
          self.clickOffsetX = false;
          self.clickOffsetY = false;
        })
      );
    }

    fullComponent.node = div.node();
    fullComponent.intervals = [];
    let tb = div.append('div')
      .attr('class', `title-bar`)
      .html(`<span id="componentTitle-${uuid}">${comp.title}</span>`);

    self.components.push(div);
    let keyQueries = [];
    for (let sink of comp.dataSinks) {
      keyQueries.push(fetch('/apina/datasinks/getReadKey/'+sink.id, {credentials: 'include'}).then(r => r.json()));
      window.socket.on(sink.title, newData => {
        let newDataEvent = new CustomEvent('newData', { detail: { dataSink: sink, newData } });
        fullComponent.node.dispatchEvent(newDataEvent);
      });
    }
    for (let source of comp.dataSources) {
      fetch(source.url).then(r => r.json()).then(resp => {
        let newDataEvent = new CustomEvent('newData', { detail: { dataSource: source, newData: resp } });
        fullComponent.node.dispatchEvent(newDataEvent);
      });
      if (source.interval) {
        fullComponent.intervals.push({sourceTitle: source.title, timer: setInterval(() => {
          fetch(source.url).then(r => r.json()).then(resp => {
            let newDataEvent = new CustomEvent('newData', { detail: { dataSource: source, newData: resp } });
            fullComponent.node.dispatchEvent(newDataEvent);
          });
        }, source.interval) });
      }
    }
    self.individualComponents.push({uuid, component: comp, node: fullComponent.node, intervals: fullComponent.intervals });
    let node = fullComponent.node;
    (() => { eval(comp.script) }).call(isMobile ? Object.assign(comp, { width: node.clientWidth }) : comp);
    let createdEvent = new CustomEvent('created', { detail: { uuid, width: parseInt(isMobile ? node.clientWidth : comp.width), height: parseInt(comp.height) } });
    fullComponent.node.dispatchEvent(createdEvent);

    Promise.all(keyQueries).then(keys => {
      let dataQueries = [];
      for (let key in keys) {
        comp.dataSinks[key].readKey = keys[key].readKey;
        let orderBy = '', limit = '';
        if (comp.dataSinks[key].orderBy) {
          orderBy = `orderBy=${comp.dataSinks[key].orderBy}&`;
        }
        if (comp.dataSinks[key].limit) {
          limit = `limit=${comp.dataSinks[key].limit}`;
        }
        dataQueries.push(fetch(`/d/r/${keys[key].readKey}/${comp.dataSinks[key].id}?${orderBy}${limit}`, {credentials: 'include'}).then(r => r.json()));
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

    if (editing && !isMobile) {
      let tb = node.querySelector(`.title-bar`);
      let trashIcon = document.createElement('span');
      trashIcon.className = 'trash-icon material-icons';
      trashIcon.innerText = 'delete';
      trashIcon.onclick = window.deleteComponent.bind(self, uuid);
      tb.append(trashIcon);
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
    if (comp.externalScripts) {
      for (let externalScript of comp.externalScripts) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = externalScript;
        let event = new CustomEvent('externalResourceLoaded', { detail: { type: 'script', uri: externalScript } });
        script.onload = () => node.dispatchEvent(event);
        document.body.append(script);
      }
    }
    if (comp.externalStyles) {
      for (let externalStyle of comp.externalStyles) {
        let link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = externalStyle;
        let event = new CustomEvent('externalResourceLoaded', { detail: { type: 'style', uri: externalStyle } });
        link.onload = () => setTimeout(() => node.dispatchEvent(event), 0);
        document.body.append(link);
      }
    }
    return fullComponent;
};
