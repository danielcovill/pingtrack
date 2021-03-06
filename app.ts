import * as fs from 'fs';
import Data from './data';
import Pinger from './pinger';
import * as dns from 'dns'

let settings: any = JSON.parse(fs.readFileSync("config.json").toString());
let data: Data = new Data(settings.db_location);

// Set up the initial database file 
data.initialize(true)
// Look up the IPs of the hosts and read them into the DB 
.then(() => { 
    return setUpHosts(settings.hosts); 
})
// Set up a data collection object for each valid host and start pinging 
.then((validHostIds) => { 
    return pingHosts(validHostIds);
})
.catch((err) => {
    console.log(err.message);
    process.exit(1);
});

/*
 * Input: String[] containing list of hostIds
 * Returns: Promise that contains all the resulting ping objects with their results logged in the db
 * Description: With the settings indicated in the configuration file, the method
 * will ping each valid host regularly, storing the results in the database.
 */
function pingHosts(validHostIds: Array<number>) {
    let pingerCollection: Array<Pinger> = [];
    let pingerRunPromises: Array<Promise<Array<number>>> = [];

    validHostIds.forEach((hostId: number) => {
        pingerCollection.push(new Pinger(data, hostId, settings.ping_frequency, settings.ping_duration, (settings.ping_timeout/1000)));
    });

    pingerCollection.forEach((pinger) => {
        pingerRunPromises.push(pinger.begin());
    });

    return Promise.all(pingerRunPromises);
}

/*
 * Input: String[] containing list of hosts to get IP addresses for
 * Returns: Promise resolving to String[] containing the host names for which IPs could be determined on lookup
 */
function setUpHosts(hostList: Array<string>) {
    let nameResolutionPromises: Array<Promise<any>> = [];
    let dataEntryPromises: Array<Promise<number>> = [];

    hostList.forEach((host: string) => {
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
        return Promise.reject(err);
    });
}