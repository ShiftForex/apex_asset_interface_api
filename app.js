const express = require("express");
const bodyParser = require("body-parser");
const request = require('request');
const fs = require('fs');
const util = require('util');

const config = require("./config.js");
// const initializeWebSocketClient = require("./lib/websocketClient.js");
const loadRoutes = require('./routes')



// main function
const main = async () => {

    try {
        // initialize logger
        const logger =  await initializeLogger()

        // initialize app
        const app = await initializeExpressApp(express())

        // load restful routes 
        loadRoutes(app);
        
        await app.listen(config.port)

        logger.info("Listening on port %s...", config.port);
        console.log("Listening on port %s...", config.port);

        // initialize webSocketClient
        // initializeWebSocketClient()

        console.log("Application started successfully!!");
    } catch (error) {
        console.log(error)
    }
    
}

main()



function initializeExpressApp(app){

    console.log('initializing express app')

    app.use(bodyParser.json());
    app.use(bodyParser.text());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/uploadXml',bodyParser.text({type: '*/xml'}), (req,res,next) => next());
    app.use(express.static('../client'));

    app.use((req, res, next) => {

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

    return Promise.resolve(app)
}

async function initializeLogger() {

    // TODO: convert this at some point to winston logger...

    function ensureDirectoryExists(path, mask) {

        console.log('inside ensureDirectoryExists')
        console.log(`path: ${path}`)
        console.log(`mask: ${mask}`)

        return new Promise((resolve, reject) => {

            fs.mkdir(path, mask, function(err) {

                console.log('inside mkdir callback..')
                console.log(err)

                let result
    
                if (err) {
                    if (err.code == 'EEXIST') { 
                        result = "exists"
                    } else {
                        console.log('oops an error:')
                        console.log(err)
                        reject(err)
                    }
                } else {
                    result = "created"
                }
    
                return resolve(result)
            });
            
          });
        
       
    }

    try {

        console.log('initializing logger...')

        const dirStatus = await ensureDirectoryExists(__dirname + '/logs', 0755)

        console.log('dirStatus')
        console.log(dirStatus)

        if(dirStatus === "exists"){
            console.log("logs folder already exists");
        } else if(dirStatus === "created"){
            console.log("logs folder created successfully")
        }

        console.log("about to create logger...")

        const loggerOpts = {
            logDirectory: __dirname + '/logs',
            fileNamePattern: 'gubiq_app-<date>.log',
            dateFormat:'YYYY.MM.DD'
        };

        const logger = require('simple-node-logger').createRollingFileLogger(loggerOpts);

        const appender = logger.getAppenders()[0];
        console.log('The logs are written to the following file: ', appender.__protected().currentFile );

        return Promise.resolve(logger)
    

    } catch(error) {
        console.log(error)
        console.log("logger could not be initialized")
    }
}