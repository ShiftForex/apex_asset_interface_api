var gubiqRouter = function(app) {

    var gubiq = require("../lib/gubiq-routes.js");
    var config = require('../config.js');
    const log = require('simple-node-logger').createRollingFileLogger( config.logOptions );
    
    app.post("/getBlockNumber", function(req, res) {

        log.info("getBlockNumber");
        log.info(req.body);
        var method = req.body.method;

        if(method != 'getBlockNumber')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiq.getBlockNumber(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                log.info("getBlockNumber details");
                log.info(result);
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getNodeinfo", function(req, res) {

        log.info("getNodeInfo");
        log.info(req.body);
        var method = req.body.method;

        if(method != 'getNodeInfo')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiq.getNodeInfo(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                log.info("getNodeInfo details");
                log.info(result);
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getGasPrice", function(req, res) {

        log.info("getGasPrice");
        log.info(req.body);
        var method = req.body.method;

        if(method != 'getGasPrice' || method === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiq.getGasPrice(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                log.info("getWalletBalance: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });

    app.post("/getAccounts", function(req, res) {

        log.info("getAccounts");
        log.info(req.body);
        var method = req.body.method;

        if(method != 'getAccounts' || method === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiq.getAccounts(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                log.info("getAccounts: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/isSyncing", function(req, res) {

        log.info("isSyncing");
        log.info(req.body);
        var method = req.body.method;

        if(method != 'isSyncing' || method === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiq.isSyncing(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                log.info("getWalletBalance: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getWalletBalance", function(req, res) {

        log.info("getWalletBalance");
        log.info(req.body);
        var method = req.body.method;

        if(method != 'getWalletBalance' || method === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiq.getWalletBalance(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                log.info("getWalletBalance: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    
}
module.exports = gubiqRouter;
