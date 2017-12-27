const blessed = require('blessed');
const contrib = require('blessed-contrib');
const io = require('./io.js');

const device = 'wlp3s0';

var screen = blessed.screen();

var lastStat = io.getDeviceStatsFor(device);

var graph = contrib.line({
  width: 80,
  height: 30,
  left: 0,
  top: 0,  
  xPadding: 5,
  label: 'Tx / Rx',
  showLegend: true,
  legend: {
    width: 12
  }
});

var tx = [];
var rx = [];

var data = [ { title: 'Transmit',
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

screen.append(graph);
graph.setData(data);

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.render();

function updateData() {
  currentStat = io.getDeviceStatsFor(device); 
  var tx = currentStat.transmit.bytes - lastStat.transmit.bytes;
  var rx = currentStat.receive.bytes - lastStat.receive.bytes;

  data[0].y = data[0].y.slice(1, 20);
  data[1].y = data[1].y.slice(1, 20);

  data[0].y.push(tx);
  data[1].y.push(rx);

  lastStat = currentStat;
  
  graph.setData(data);
  screen.render();
}

setInterval(updateData, 1000);
