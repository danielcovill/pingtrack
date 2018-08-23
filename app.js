let ping = require('ping');
let fs = require('fs');
let Data = require('./data');

let settings = JSON.parse(fs.readFileSync("config.json"));
let data = new Data(settings.db_location);

data.initialize(true).catch((err) => {
    console.log(err.message);
    process.exit();
});

// Gather hosts. Set up ping for each arg if possible, storing results in sqlite.
let hosts = settings.hosts;
let invalid_hosts = [];

//set up all the hosts
console.log("Setting up hosts");
let hostSetupPromises = [];
hosts.forEach(function(host) {
    hostSetupPromises.push(ping.promise.probe(host, {
        timeout: settings.ping_frequency
    }).then((response) => {
        if(!response.host || !response.numeric_host) {
            invalid_hosts.push(host);
            return new Promise((resolve) => { resolve(); });
        }
        return data.addHost(response.host, response.numeric_host);
    }).catch((err) => {
        console.log(err.message);
        console.log("Attempting to continue");
    }));
});

Promise.all(hostSetupPromises).then(() => {
    process.exit();
})

/*
        console.log(response.host 
            + ' (' + response.numeric_host + ') : ' 
            + (response.time == 'unknown' ? -1 : response.time) 
            + 'ms');
*/