const express = require("express")
const bodyParser = require("body-parser")
const request = require('request')
const fs = require('fs')
const util = require('util')

const config = require("./config.js")
const initializeWebSocketClient = require("./lib/websocketClient.js")
const loadRoutes = require('./routes')
let logger

// main function
const main = async () => {
    try {
        // initialize logger
        logger =  await initializeLogger()

        // initialize app
        const app = await initializeExpressApp(express())

        // load restful routes 
        loadRoutes(app)
        
        await app.listen(config.port)

        // initialize webSocketClient
        await initializeWebSocketClient(logger)

        logger.log(`apex_wallet_api started successfully on port ${config.port}`)
    } catch (error) {
        logger.log(error)
    }
}

main()

function initializeExpressApp(app){
    try {
        logger.log('initializing express app')

        app.use(bodyParser.json())
        app.use(bodyParser.text())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use('/uploadXml',bodyParser.text({type: '*/xml'}), (req,res,next) => next())
        app.use(express.static('../client'))
        app.use((req, res, next) => {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*')

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

            // Request headers you wish to allow
            //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,authorization")

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true)

            // Pass to next layer of middleware
            next()
        })

        return Promise.resolve(app)

    } catch(error) {
        logger.log(`error in initializeExpressApp: ${error}`)

    }

    
}

async function initializeLogger() {
    // TODO: convert this at some point to winston logger...
    function ensureDirectoryExists(path, mask) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, mask, function(err) {
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
            })
          })
    }

    try {
        const dirStatus = await ensureDirectoryExists(__dirname + '/logs', 0755)

        if(dirStatus === "exists"){
            console.log("logs folder already exists")
        } else if(dirStatus === "created"){
            console.log("logs folder created successfully")
        }

        const loggerOpts = {
            logDirectory: __dirname + '/logs',
            fileNamePattern: 'gubiq_app-<date>.log',
            dateFormat:'YYYY.MM.DD'
        }

        const logger = require('simple-node-logger').createRollingFileLogger(loggerOpts)

        const logFilePath = logger.getAppenders()[0]

        const customLogger = {
            log: function(message){
                logger.info(message)
                console.log(message)
            }
        }

        return Promise.resolve(customLogger)
    

    } catch(error) {
        console.log(`error in initializeLogger: ${error}`)
    }
}