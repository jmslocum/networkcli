const blessed = require('blessed');
const contrib = require('blessed-contrib');
const io = require('./io.js');

const device = 'wlp3s0';

var screen = blessed.screen();
var grid = new contrib.grid({rows : 2, cols: 2, screen: screen});
var lastStat = io.getDeviceStatsFor(device);

var graph = grid.set(0, 0, 2, 1, contrib.line, {
 // xPadding: 5,
  label: 'Tx / Rx',
  showLegend: true,
  legend: {
    width: 12
  }
});

var bar = grid.set(1, 1, 1, 1, contrib.stackedBar, {
  label: 'Throughput (%)',
  barWidth: 6,
  barSpacing: 2,
  barBgColor: [ 'red', 'yellow' ],
});

var info = grid.set(0, 1, 1, 1, blessed.box, {
  label: device + ' info',
  style : {
    fg: 'blue'
  }
});


var tx = [];
var rx = [];

var lineData = [ { title: 'Transmit',
  x: [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
  y: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  style: {
    line: 'red'
  }
},
{ title: 'Receive',
  x: [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
  y: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  style: {
    line: 'yellow'
  }
}];

var barData = {
  barCategory: [device],
  stackedCategory: ['% Transmit', '% Receive'],
  data : [[0, 0]]
};

graph.setData(lineData);
bar.setData(barData);

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

setDeviceInfoContent();
screen.render();

function setDeviceInfoContent() {
  var activeDevices = io.getActiveDevices();
  var line = '';
  var currentDevice = activeDevices[device][0];
  Object.keys(currentDevice).forEach(function(item) {
    line += item + ': ' + currentDevice[item] + '\n';
    info.setContent(line);
    screen.render();
  });

}

function updateData() {
  currentStat = io.getDeviceStatsFor(device); 
  var tx = currentStat.transmit.bytes - lastStat.transmit.bytes;
  var rx = currentStat.receive.bytes - lastStat.receive.bytes;
  var total = tx + rx;

  var percentTx = parseInt((tx / total) * 100);
  var percentRx = parseInt((rx / total) * 100);

  barData.data = [[ percentTx, percentRx ]];

  lineData[0].y = lineData[0].y.slice(1, 20);
  lineData[1].y = lineData[1].y.slice(1, 20);

  lineData[0].y.push(tx);
  lineData[1].y.push(rx);

  lastStat = currentStat;
  
  graph.setData(lineData);
  bar.setData(barData);
  screen.render();
}

setInterval(updateData, 500);
