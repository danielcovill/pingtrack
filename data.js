"use strict";
let sqlite3 = require('sqlite3');

class Data {

    constructor (db_location) {
        this.db = new sqlite3.Database(db_location);
    }

    initialize (forceOverwrite) {
        const dropTableStructure=`
            begin;
            DROP TABLE IF EXISTS Hosts;
            DROP TABLE IF EXISTS Results;
            commit;
        `;
        const createTableStructure= `
            begin;
            CREATE TABLE IF NOT EXISTS 'Hosts' (
                Id INTEGER PRIMARY KEY,
                DomainName TEXT Unique NOT NULL,
                IP TEXT Unique NOT NULL
            );
            CREATE TABLE IF NOT EXISTS 'Results' (
                Id INTEGER PRIMARY KEY,
                HostId INTEGER,
                DateTime TEXT,
                ResponseTimeMS INTEGER
            )
            commit;
        `;
        if(forceOverwrite) {
            this.db.exec(dropTableStructure, (err) => { (err) ? reject(err) : resolve(); });
        }
        this.db.exec(createTableStructure, (err) => { (err) ? reject(err) : resolve(); });
    }

    addHost(hostURL, hostIP) {
        const checkHostExists = 'SELECT COUNT(1) AS recordCount FROM Hosts WHERE DomainName=? AND IP=?;';
        this.db.get(checkHostExists, undefined, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.hostId);
            }
        });

        const createHost = 'INSERT OR REPLACE INTO Hosts (DomainName, IP) VALUES (?, ?);';
        this.db.run(createHost, [hostURL, hostIP], (err) => { (err) ? reject(err) : resolve(); });
    }

    addPingResult(hostId, responseTimeMS) {
        const addResult = "INSERT INTO Results (HostId, DateTime, ResponseTimeMS) VALUES (?, date('now'), ?);";
        this.db.run(addResult, [hostId, responseTimeMS], (err) => { (err) ? reject(err) : resolve(); });
    }
}
module.exports=Data;