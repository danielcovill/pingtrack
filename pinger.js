"use strict"
const ping = require('ping');

class Pinger {
    constructor(_database, _targetId, _frequency, _duration, _ping_timeout) {
        this.configurationPromises = [];
        this.database = _database;
        this.targetId = _targetId
        this.frequency = _frequency;
        this.duration = _duration;
        this.pingConfig = {
            numeric: true,
            min_reply: 10
        }
    }

    begin() {
        let pingPromises = [];

        return this.database.getHostById(this.targetId)
        .then((target) => {
            let intervalId = setInterval(() => {
                pingPromises.push(
                    ping.promise.probe(target.IP, this.pingConfig)
                    .then((value) => {
                        let time = (value.time === 'unknown') ? -1 : value.time;
                        // console.log('target: ' + target.IP + ' time: ' + time);
                        return this.database.addPingResult(this.targetId, time);
                    })
                );

                if((this.duration -= this.frequency) <= 0) {
                    clearInterval(intervalId);
                }
            }, this.frequency);
            
            return Promise.all(pingPromises);
        });
    }
}
module.exports=Pinger;