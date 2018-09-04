"use strict";
const ping = require('ping');
const fs = require('fs');
const Data = require('./data');
const dns = require('dns');

let settings = JSON.parse(fs.readFileSync("config.json"));
let data = new Data(settings.db_location);

// Set up the initial database file then
data.initialize(true)
// Look up the IPs of the hosts and read them into the DB then
.then(() => { 
    return setUpHosts(settings.hosts); 
})
// Set up a data collection object for each valid host and start pinging then
.then(() => { 
    return pingHosts(settings.hosts);
})
// Once you're done with the pinging, exit
.then(() => { process.exit(0); })
.catch((err) => {
    console.log(err.message);
    process.exit(1);
});

/*
 * Input: String[] containing list of hosts
 * Returns: Nothing
 * Description: With the settings indicated in the configuration file, the method
 * will ping each valid host regularly, storing the results in the database.
 */
function pingHosts(hostList) {
    return data.getHostsByName(hostList).then((hosts) => {
        console.log("hosts.length");
        console.log(hosts.length);
        hosts.forEach((host) => {
            console.log("host");
            console.log(host);
        });
    }).then(() => {
        return Promise.resolve("ok");
    }).catch((err) => {
        return Promise.reject(err);
    });
}

/*
 * Input: String[] containing list of hosts to get IP addresses for
 * Returns: Promise resolving to String[] containing the host names for which IPs could be determined on lookup
 */
function setUpHosts(hostList) {
    let nameResolutionPromises = [];
    let dataEntryPromises = [];

    hostList.forEach((host) => {
        nameResolutionPromises.push(new Promise((resolve) => {
            dns.lookup(host, (err, address) => {
                if (err) {
                    console.log("Error with host: " + host + " - Skipping");
                    console.log(err.message);
                    resolve({ "host": host, "ip": null });
                } else {
                    resolve({ "host": host, "ip": address });
                }
            });
        }));
    });

    return Promise.all(nameResolutionPromises)
    .then((responses) => {
        responses.forEach((response) => {
            if (!!response.ip) {
                dataEntryPromises.push(data.addHost(response.host, response.ip));
            }
        });
        return Promise.all(dataEntryPromises);
    }).catch((err) => {
        console.log(err.message);
        return Promise.reject(err);
    });
}