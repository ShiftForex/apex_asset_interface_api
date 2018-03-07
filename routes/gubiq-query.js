var gubiqRouter = function(app) {

    var gubiq = require("../lib/gubiq-routes.js");
    var config = require('../config.js');

    app.post("/getBlockNumber", function(req, res) {

        console.log("getBlockNumber");
        console.log(req.body);
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
                console.log("getBlockNumber details");
                console.log(result);
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getNodeinfo", function(req, res) {

        console.log("getNodeInfo");
        console.log(req.body);
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
                console.log("getNodeInfo details");
                console.log(result);
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getGasPrice", function(req, res) {

        console.log("getGasPrice");
        console.log(req.body);
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
                console.log("getWalletBalance: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });

    app.post("/getAccounts", function(req, res) {

        console.log("getAccounts");
        console.log(req.body);
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
                console.log("getAccounts: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/isSyncing", function(req, res) {

        console.log("isSyncing");
        console.log(req.body);
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
                console.log("getWalletBalance: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getWalletBalance", function(req, res) {

        console.log("getWalletBalance");
        console.log(req.body);
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
                console.log("getWalletBalance: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    
}
module.exports = gubiqRouter;
