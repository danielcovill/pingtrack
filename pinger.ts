import ping from 'ping';
import Data from './data';

export default class Pinger {
    database: Data;
    targetId: number;
    frequency: number;
    duration: number;
    pingConfig: { numeric: boolean; min_reply: number; };

    constructor(_database: Data, _targetId: number, _frequency: number, _duration: number, _ping_timeout: number) {
        this.database = _database;
        this.targetId = _targetId
        this.frequency = _frequency;
        this.duration = _duration;
        this.pingConfig = {
            numeric: true,
            min_reply: 10
        }
    }

    begin() : Promise<Array<number>> {
        let pingPromises : Array<Promise<number>> = [];

        return this.database.getHostById(this.targetId)
        .then((target) => {
            let intervalId = setInterval(() => {
                pingPromises.push(
                    ping.promise.probe(target.IP, this.pingConfig)
                    .then((value: any) => {
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