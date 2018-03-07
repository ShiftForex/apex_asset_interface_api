var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
 
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
 
var gubiqRoutes = require("./routes/gubiq-query.js")(app);
var gubiqAccountRoutes = require("./routes/gubiqAccount.js")(app);
//var websocketRoutes = require("./lib/websocketClient.js");
//var database = require("./lib/database.js");
 
var server = app.listen(6000, function () {
    console.log("Listening on port %s...", server.address().port);
});