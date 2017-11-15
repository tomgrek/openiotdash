export default () => {
return {
  title: 'Bubble',
  uuid: null,
  content:
  `<div class="bubble" style="position: absolute; top: 1.5rem; width: calc(100% - 0.5px); height: calc(100% - calc(1.5rem + 0.5px));">
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
    bgColor: '#81bdff',
    bubbleColor: '#ccefff',
  },
  settingsDisplay:
    `<div>
    <h3>Settings for this component:</h3>
    <div><span>Color: </span><input id="bgColor" type="text"></input></div>
    <div><span>Bubble: </span><input id="bubbleColor" type="text"></input></div>
    </div>`,
  height: 150,
  width: 300,
  transform: '',
  offsetX: 0,
  offsetY: 0,
  mouseOffset: {
    x: 0,
    y: 0,
  },
  animationFrame: null,
  script: `
            const drawChart = (e) => {
              let val = 0;
              if (this.animationFrame) {
                window.cancelAnimationFrame(this.animationFrame);
              }
              let firstKey = Object.keys(this.data)[0];
              if (firstKey && this.data && this.data[firstKey]) {
                let lastDP = this.data[firstKey][this.data[firstKey].length - 1];
                if (lastDP.data) {
                  let parsed = JSON.parse(lastDP.data);
                  if (parsed.value) val = parsed.value;
                }
              }
              let canvas = document.querySelector('#canvas' + this.uuid);
              if (!canvas) return;
              let ctx = canvas.getContext('2d');
              let bubbles = [];
              let bubbleCount = Math.min(Math.max(val, 0) * 50, 100);
              let bubbleSpeed = Math.min(Math.max(val, 0), 2.0);
              let popLines = 6;
              let popDistance = 40;
              const animate = () => {
                  ctx.clearRect(0, 0, this.width, this.height + 24);

                  ctx.beginPath();
                  for (var i = 0; i < bubbles.length; i++) {
                    bubbles[i].position.x = Math.sin(bubbles[i].count/bubbles[i].distanceBetweenWaves) * 50 + bubbles[i].xOff;
                    bubbles[i].position.y = bubbles[i].count;
                    bubbles[i].render();

                    if(bubbles[i].count < 0 - bubbles[i].radius) {
                      bubbles[i].count = this.height + bubbles[i].yOff;
                    } else {
                      bubbles[i].count -= bubbleSpeed;
                    }
                  }

                  for (var i = 0; i < bubbles.length; i++) {
                    if (this.mouseOffset.x > bubbles[i].position.x - bubbles[i].radius && this.mouseOffset.x < bubbles[i].position.x + bubbles[i].radius) {
                      if (this.mouseOffset.y > bubbles[i].position.y - bubbles[i].radius && this.mouseOffset.y < bubbles[i].position.y + bubbles[i].radius) {
                        for (let a = 0; a < bubbles[i].lines.length; a++) {
                          popDistance = bubbles[i].radius * 0.5;
                          bubbles[i].lines[a].popping = true;
                          bubbles[i].popping = true;
                        }
                      }
                    }
                  }

                  this.animationFrame = window.requestAnimationFrame(animate);
                }

                this.animationFrame = window.requestAnimationFrame(animate);
                let color = this.settings.bgColor;
                let bubbleColor = this.settings.bubbleColor;
                function createBubble() {
                  this.position = {x: 0, y: 0};
                  this.radius = 8 + Math.random() * 6;
                  this.xOff = Math.random() * canvas.clientWidth - this.radius;
                  this.yOff = Math.random() * canvas.clientHeight;
                  this.distanceBetweenWaves = 50 + Math.random() * 40;
                  this.count = canvas.clientHeight + this.yOff;
                  this.color = bubbleColor;
                  this.lines = [];
                  this.popping = false;
                  this.maxRotation = 85;
                  this.rotation = Math.floor(Math.random() * (this.maxRotation - (this.maxRotation * -1))) + (this.maxRotation * -1);
                  this.rotationDirection = 'forward';

                  for (var i = 0; i < popLines; i++) {
                    var tempLine = new createLine();
                        tempLine.bubble = this;
                        tempLine.index = i;

                    this.lines.push(tempLine);
                  }

                  this.resetPosition = function() {
                    this.position = {x: 0, y: 0};
                    this.radius = 8 + Math.random() * 6;
                    this.xOff = Math.random() * canvas.clientWidth - this.radius;
                    this.yOff = Math.random() * canvas.clientHeight;
                    this.distanceBetweenWaves = 50 + Math.random() * 40;
                    this.count = canvas.clientHeight + this.yOff;
                    this.popping = false;
                  }

                  this.render = () => {
                    if (this.rotationDirection === 'forward') {
                      if (this.rotation < this.maxRotation) {
                        this.rotation++;
                      } else {
                        this.rotationDirection = 'backward';
                      }
                    } else {
                      if(this.rotation > this.maxRotation * -1) {
                        this.rotation--;
                      } else {
                        this.rotationDirection = 'forward';
                      }
                    }

                    ctx.save();
                    ctx.translate(this.position.x, this.position.y);
                    ctx.rotate(this.rotation*Math.PI/180);

                    if (!this.popping) {
                      ctx.beginPath();
                      ctx.strokeStyle = bubbleColor;
                      ctx.lineWidth = 1;
                      ctx.arc(0, 0, this.radius - 3, 0, Math.PI*1.5, true);
                      ctx.stroke();

                      ctx.beginPath();
                      ctx.arc(0, 0, this.radius, 0, Math.PI*2, false);
                      ctx.stroke();
                    }

                    ctx.restore();

                    for (let a = 0; a < this.lines.length; a++) {
                      if (this.lines[a].popping) {
                        if (this.lines[a].lineLength < popDistance && !this.lines[a].inversePop) {
                          this.lines[a].popDistance += 0.06;
                        } else {
                          if(this.lines[a].popDistance >= 0) {
                            this.lines[a].inversePop = true;
                            this.lines[a].popDistanceReturn += 1;
                            this.lines[a].popDistance -= 0.03;
                          } else {
                            this.lines[a].resetValues();
                            this.resetPosition();
                          }
                        }

                        this.lines[a].updateValues();
                        this.lines[a].render();
                      }
                    }
                  }
                }

                for (let i = 0; i < bubbleCount; i++) {
                  bubbles.push(new createBubble());
                }

                function createLine() {
                  this.lineLength = 0;
                  this.popDistance = 0;
                  this.popDistanceReturn = 0;
                  this.inversePop = false;
                  this.popping = false;

                  this.resetValues = function() {
                    this.lineLength = 0;
                    this.popDistance = 0;
                    this.popDistanceReturn = 0;
                    this.inversePop = false;
                    this.popping = false;

                    this.updateValues();
                  }

                  this.updateValues = function() {
                    this.x = this.bubble.position.x + (this.bubble.radius + this.popDistanceReturn) * Math.cos(2 * Math.PI * this.index / this.bubble.lines.length);
                    this.y = this.bubble.position.y + (this.bubble.radius + this.popDistanceReturn) * Math.sin(2 * Math.PI * this.index / this.bubble.lines.length);
                    this.lineLength = this.bubble.radius * this.popDistance;
                    this.endX = this.lineLength;
                    this.endY = this.lineLength;
                  }

                  this.render = () => {
                    this.updateValues();

                    ctx.beginPath();
                    ctx.strokeStyle = bubbleColor;
                    ctx.lineWidth = 2;
                    ctx.moveTo(this.x, this.y);
                    if (this.x < this.bubble.position.x) {
                      this.endX = this.lineLength * -1;
                    }
                    if (this.y < this.bubble.position.y) {
                      this.endY = this.lineLength * -1;
                    }
                    if (this.y === this.bubble.position.y) {
                      this.endY = 0;
                    }
                    if (this.x === this.bubble.position.x) {
                      this.endX = 0;
                    }
                    ctx.lineTo(this.x + this.endX, this.y + this.endY);
                    ctx.stroke();
                  };
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
              console.log(this.data);
              drawChart(e);
            });
            node.addEventListener('newData', e => {
              if (e.detail.dataSink) {
                if (this.data[e.detail.dataSink.title] && this.data[e.detail.dataSink.title].length >= e.detail.dataSink.limit) {
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
              let canvasNode = document.createElement('canvas');
              canvasNode.id = 'canvas'+this.uuid;
              canvasNode.style.width = '100%';
              canvasNode.style.height = '100%';
              canvasNode.style['background-color'] = this.settings.bgColor;
              document.querySelector('[uuid=' + this.uuid + ']').querySelector('.bubble').appendChild(canvasNode);
              drawChart();
            });
            node.addEventListener('resized', (e) => {
              let meNode = document.querySelector('[uuid=' + this.uuid + ']').querySelector('.bubble');
              meNode.removeChild(meNode.querySelector('canvas'));
              let canvasNode = document.createElement('canvas');
              canvasNode.id = 'canvas'+this.uuid;
              canvasNode.style.width = '100%';
              canvasNode.style.height = '100%';
              canvasNode.style['background-color'] = this.settings.bgColor;
              meNode.appendChild(canvasNode);
              drawChart();
            });
            node.addEventListener('settingsChanged', (e) => {
              let myCanvas = document.querySelector('[uuid=' + this.uuid + '] .bubble canvas');
              myCanvas.style['background-color'] = this.settings.bgColor;
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
  style: 'return `[uuid=${uuid}] .component-settings { color: green; } \
            #${uuid} span { color: blue; }`',
  }
}
