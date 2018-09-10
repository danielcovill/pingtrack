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

    getHostById(hostId) {
        let getHostById = "SELECT Id, DomainName, IP FROM Hosts WHERE Id = ?";
        return new Promise((resolve, reject) => {
            this.db.get(getHostById, [hostId], (err, row) => {
                if(!!err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getHostsByName(hostURLArray) {
        /* 
         * This isn't a great approach as inputs aren't sanitized, but the node sqlite3 package doesn't 
         * currently support passing in arrays for queries like this. I'll fix it later or let the node 
         * sqlite3 package fix it. 
         */
        let getHostList = "SELECT Id, DomainName, IP FROM Hosts WHERE DomainName IN ('" + hostURLArray.join("','") + "')";
        
        return new Promise((resolve, reject) => {
            this.db.all(getHostList, (err, rows) => {
                if(!!err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /*
     * Resolves: ID of item if exists, ID of new item if added
     */
    addHost(hostURL, hostIP) {
        const checkHostExists = 'SELECT Id FROM Hosts WHERE DomainName=? AND IP=?;';
        const addHost = 'INSERT INTO Hosts (DomainName, IP) VALUES (?, ?);';

        return new Promise((resolve, reject) => { 
            this.db.all(checkHostExists, [hostURL, hostIP], (err, rows) => {
                if (!!err) {
                    reject(err);
                } else if (rows.length === 0) {
                    // No ES6 syntax here due to "this" behavior needed
                    // https://github.com/mapbox/node-sqlite3/issues/962
                    this.db.run(addHost, [hostURL, hostIP], function(err) { 
                        (err) ? reject(err) : resolve(this.lastID); 
                    });
                } else if (rows.length === 1) {
                    resolve(rows[0].Id)
                } else if (rows.length > 1) {
                    reject(new Error("DB Inconsistency detected"));
                }
            });
        });
    }

    addPingResult(hostId, responseTimeMS) {
        const addResult = "INSERT INTO Results (HostId, DateTime, ResponseTimeMS) VALUES (?, datetime('now'), ?);";

        return new Promise((resolve, reject) => {
            this.db.run(addResult, [hostId, responseTimeMS], (err) => { (err) ? reject(err) : resolve(this.lastID); });
        });
    }
}
module.exports=Data;