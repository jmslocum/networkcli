(function() {
  const os = require('os');
  const fs = require('fs');

  function getActiveDevices() {
    var allInterfaces = os.networkInterfaces();
    var devices = Object.keys(allInterfaces);
    var physicalDevices = {};
    for (var i = 0; i < devices.length; i++) {
      if (allInterfaces[devices[i]][0].internal === false){
        physicalDevices[devices[i]] = allInterfaces[devices[i]];
      }
    }

    return physicalDevices;
  }

  function getProcNetDevContents() {
    return fs.readFileSync('/proc/net/dev', 'utf8');
  }

  function getAllDeviceStats() {
    var net = getProcNetDevContents();
    var stats = net.split('\n');
    stats.splice(0, 2);

    //Now there are only the stats, each line is an element in the array
    //now squeeze the spaces into one space.
    for (var i = 0; i < stats.length; i++){
      stats[i] = stats[i].replace(/ +(?= )/g,'').replace(':', '').trim();
    }

    //Now we have just the stats with no spaces and no 'bad' characters
    //convert it to a stats object

    var allStats = [];
    for (var i = 0; i < stats.length; i++) {
      if (!stats[i] || stats[i].length <= 0){
        continue;
      }

      var statsLine = stats[i].split(' ');
      var stat = {};
      var receive = {};
      var transmit = {};
      stat.interface = statsLine[0];
      receive.bytes = parseInt(statsLine[1]);
      receive.packets = parseInt(statsLine[2]);
      receive.errors = parseInt(statsLine[3]);
      receive.drop = parseInt(statsLine[4]);
      receive.fifo = parseInt(statsLine[5]);
      receive.frame = parseInt(statsLine[6]);
      receive.compressed = parseInt(statsLine[7]);
      receive.multicast = parseInt(statsLine[8]);
      stat.receive = receive;

      transmit.bytes = parseInt(statsLine[9]);
      transmit.packets = parseInt(statsLine[10]);
      transmit.errors = parseInt(statsLine[11]);
      transmit.drop = parseInt(statsLine[12]);
      transmit.fifo = parseInt(statsLine[13]);
      transmit.colls = parseInt(statsLine[14]);
      transmit.carrier = parseInt(statsLine[15]);
      transmit.compressed = parseInt(statsLine[16]);
      stat.transmit = transmit;

      allStats.push(stat);
    }

    return allStats;
  }

  function getDeviceStatsFor(device) {
    var allStats = getAllDeviceStats();
    for (var i = 0; i < allStats.length; i++){
      if (allStats[i].interface === device){
        return allStats[i];
      }
    }
  }

  function formatBytes(bytes, percision){
    if(0 == bytes)
      return"0 Bytes";

    var c = 1024, 
      d = percision || 2,
      labels = ["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],
      f=Math.floor(Math.log(bytes)/Math.log(c));
    return parseFloat((bytes/Math.pow(c,f)).toFixed(d))+" "+labels[f]
  }

  var io = {
    getActiveDevices : getActiveDevices,
    getAllDeviceStats : getAllDeviceStats,
    getDeviceStatsFor : getDeviceStatsFor,
    formatBytes : formatBytes
  };

  module.exports = io;

})();
