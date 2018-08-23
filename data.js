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
            );
            commit;
        `;
        return new Promise((resolve, reject) => {
            if(forceOverwrite) {
                this.db.exec(dropTableStructure, (err) => { if (err) { reject(err); } });
            }
            this.db.exec(createTableStructure, (err) => { (err) ? reject(err) : resolve(); });
        });
    }

    addHost(hostURL, hostIP) {
        const checkHostExists = 'SELECT Id FROM Hosts WHERE DomainName=? AND IP=?;';
        const addHost = 'INSERT INTO Hosts (DomainName, IP) VALUES (?, ?);';

        return new Promise((resolve, reject) => { 
            this.db.all(checkHostExists, [hostURL, hostIP], (err, rows) => {
                if (err) {
                    reject(err);
                } else if (rows.length === 0) {
                    this.db.run(addHost, [hostURL, hostIP], (err) => { (err) ? reject(err) : resolve(this.lastId); });
                } else if (rows.length === 1) {
                    resolve(rows[0].Id)
                } else if (rows.length > 1) {
                    reject(new Error("DB Inconsistency detected"));
                }
            });
        });
    }

    addPingResult(hostId, responseTimeMS) {
        const addResult = "INSERT INTO Results (HostId, DateTime, ResponseTimeMS) VALUES (?, date('now'), ?);";

        return new Promise((resolve, reject) => {
            this.db.run(addResult, [hostId, responseTimeMS], (err) => { (err) ? reject(err) : resolve(this.lastId); });
        });
    }
}
module.exports=Data;