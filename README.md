# pingtrack
Repeatedly ping one or many IP addresses or URLs, collect data, and output reports.
Run with "node app.js". To generate a report include -g as an argument followed by the desired 
filename.

# Setup

# Usage

# Notes
Domain names are resolved prior to executing ping requests in order to eliminate any latency found 
during the name lookup. 

# Configuration
The config.json file should be kept in the same directory as app.js. This file contains basic 
settings.

* hosts: 
An array of hosts (by IP or URL) for which you wish to track ping data.
* db_location: 
File system location where you'd like to store the SQLite3 database containing the data. The app 
must have access to write to the listed file location.
* ping_frequency: 
Minimum frequency in milliseconds at which ping should occur.
* ping_duration: 
Time in milliseconds for trace to run before exiting
* ping_timeout
Time in milliseconds for each ping to time out

# Version Plans
## 0.1 
Initial version that just starts setting up hosts in the database 
## 0.2 (CURRENT)
This version can ping hosts and store the data in a sqlite database
## 0.3 
This version should be able to produce a report of some kind from the generated data. Using command 
line arguments on launch you can specify if you want a report generated or to run the app.