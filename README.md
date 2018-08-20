# pingtrack
Repeatedly ping one or many IP addresses or URLs, collect data, and output reports.
Run with "node app.js". To generate a report include -g as an argument followed by the desired filename.

# Configuration
The config.json file should be kept in the same directory as app.js. This file contains basic settings.

* hosts: 
An array of hosts (by IP or URL) for which you wish to track ping data.
* db_location: 
File system location where you'd like to store the SQLite3 database containing the data. The app must have access to write to the listed file location.
* ping_frequency: 
Minimum frequency in milliseconds at which ping should occur.