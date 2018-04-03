var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
var fs = require('fs');
var util = require('util');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploadXml',bodyParser.text({type: '*/xml'}), function (req,res,next){
        next();
});
app.use(express.static('../client'));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,authorization");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(false, "FolderExists"); // ignore the error if the folder already exists
            else cb(true, err); // something else went wrong
        } else cb(false, "FolderCreated"); // successfully created folder
    });
}

ensureExists(__dirname + '/logs', 0755, function(err, result) {
    if (err) {
		console.log("Could not create the logs folder");
	}
    else {
		if(result === "FolderExists")
			console.log("logs folder already exists");
		else if(result === "FolderCreated")
			console.log("logs folder created successfully!!");
	}
});

// create a rolling file logger based on date/time that fires process events
var opts = {
    logDirectory: __dirname + '/logs',
    fileNamePattern: 'gubiq_app-<date>.log',
    dateFormat:'YYYY.MM.DD'
};

const log = require('simple-node-logger').createRollingFileLogger( opts );
 
var gubiqRoutes = require("./routes/gubiq-query.js")(app);
var gubiqAccountRoutes = require("./routes/gubiqAccount.js")(app);
var websocketRoutes = require("./lib/websocketClient.js");
 
var server = app.listen(6000, function () {
    log.info("Listening on port %s...", server.address().port);
	var appender = log.getAppenders()[0];
	console.log('The logs are written to the following file: ', appender.__protected().currentFile );
	console.log("Application started successfully!!");
});