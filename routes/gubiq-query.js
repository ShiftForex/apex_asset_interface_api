var iotaRouter = function(app) {

    var iota = require("../lib/iota-routes.js");
    var config = require('../config.js');

    app.post("/getNodeInfo", function(req, res) {

        console.log("getNodeInfo");
        console.log(req.body);
        var command = req.body.command;

        if(command != 'getNodeInfo')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        iota.getNodeInfo(command, function(err,result){
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

    app.post("/getNeighbors", function(req, res) {

        console.log("getNeighbors");
        console.log(req.body);
        var command = req.body.command;

        if(command != 'getNeighbors')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }
        iota.getNeighbors(command, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                console.log("getNeighbors details");
                console.log(result);
                res.status(200).send({result});
                return;
            }
        });
    });

    app.post("/getTips", function(req, res) {

        console.log("getTips");
        console.log(req.body);
        var command = req.body.command;

        if(command != 'getTips')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        iota.getTips(command, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                console.log("getTips details");
                console.log(result);
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/replayBundle", function(req, res) {

        console.log("replayBundle");
        console.log(req.body);
        var command = req.body.command;
        var transaction = req.body.transaction;

        if(command != 'replayBundle')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }
        
        if(transaction == null)
        {
            res.status(401).send({ msg: "Transaction is a required parameter!!"}); 
            return;
        }

        iota.replayBundle(transaction, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                console.log("replayBundle details");
                console.log(result);
                res.status(200).send({result: result});
                return;
            }
        });
    });
    
    app.post("/getBundle", function(req, res) {

        console.log("getBundle");
        console.log(req.body);
        var command = req.body.command;
        var transaction = req.body.transaction;

        if(command != 'getBundle')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }
        
        if(transaction == null)
        {
            res.status(401).send({ msg: "Transaction is a required parameter!!"}); 
            return;
        }

        iota.getBundle(transaction, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                console.log("replayBundle details");
                console.log(result);
                res.status(200).send({result: result});
                return;
            }
        });
    });
    
    app.post("/getWalletBalance", function(req, res) {

        console.log("getWalletBalance");
        console.log(req.body);
        var command = req.body.command;

        if(command != 'getWalletBalance' || command === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        iota.getWalletBalance(function(err,result){
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
    
    app.post("/getInputs", function(req, res) {

        console.log("getInputs");
        console.log(req.body);
        var command = req.body.command;

        if(command != 'getInputs' || command === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        iota.getInputs(function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                console.log("The current available inputs: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
}
module.exports = iotaRouter;
