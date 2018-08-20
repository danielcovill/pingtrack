let ping = require('ping');
let fs = require('fs');
let Data = require('./data');

let settings = JSON.parse(fs.readFileSync("config.json"));
let data = new Data(settings.db_location);

// Gather hosts. Set up ping for each arg if possible, storing results in sqlite.
let hosts = settings.hosts;
hosts.forEach(function(host) {
    // Create a timer instance that takes a host and loops, adding data to the DB

    ping.promise.probe(host, {
        timeout: settings.ping_frequency
    }).then((response) => {
        if(response.alive) {
           console.log(response.host + ' (' + response.numeric_host + ') ' + ' : ' + response.time + 'ms');
        } else {
            console.log('Host non-responsive');
        }
    });
});