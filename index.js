var Aeolus = require('aeolus');

// Determining Port
var port = process.env.PORT || 8080;

// Setting DB
var dbURL = require('./dburl.js');
Aeolus.setDB(dbURL);

// Setting API
Aeolus.methods('./api');

Aeolus.createServer(port);
