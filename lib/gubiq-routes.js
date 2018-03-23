var http = require('http');
var request = require('request');
var config = require('../config.js');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(config.gubiqNetworkHost+":"+config.gubiqNetworkPort));
var opts = {
    logDirectory: __dirname + '/../logs',
    fileNamePattern: 'gubiq_app-<date>.log',
    dateFormat:'YYYY.MM.DD-HHa'
};

const log = require('simple-node-logger').createRollingFileLogger( opts );

module.exports.getNodeInfo = function(callback){

    try{
        log.info("getNodeInfo");
        log.info("before options");
        var options = {
            url: config.gubiqNetworkHost+":"+config.gubiqNetworkPort,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json:{
                id: 1, 
                jsonrpc:"2.0",
                method: "admin_nodeInfo",
                params: []
            }
        };
        log.info("host: " + options.url);
        log.info("method: " + options.method);
        log.info("headers: " + JSON.stringify(options.headers));
        log.info("body: " + JSON.stringify(options.json));

        request(options, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                log.info("data: " + JSON.stringify(data));
                callback(false, data);
                return;
            }
            else{
                log.info('ERROR in getNodeInfo() ${error.message}');
                callback(true, error.message);
                return;
            }
        });
    }
    catch(e)
    {
        log.info("Error in getNodeInfo: "+ JSON.stringify(e));
    }
}

module.exports.getBlockNumber = function(callback){
    try{
        log.info("getBlockNumber");
        var blockNumber = 0;
        web3.eth.getBlockNumber(function(err, blockNumber){
            if(err)
            {
                log.info("error: " + err);
                callback(true, err);
                return;
            }
            blockNumber = web3.utils.hexToNumber(blockNumber);
            callback(false, blockNumber);
            return;
        });
    }
    catch(e){
        log.info("Error in getBlockNumber: "+ JSON.stringify(e));
    }
}

module.exports.getAccounts = function(callback){
    try{
        log.info("getAccounts");
        var blockNumber = 0;
        web3.eth.getAccounts(function(err, accounts){
            if(err)
            {
                log.info("error: " + err);
                callback(true, err);
                return;
            }
            log.info("Accounts List: " + JSON.stringify(accounts));
            callback(false, accounts);
            return;
        });
    }
    catch(e){
        log.info("Error in getAccounts: "+ JSON.stringify(e));
    }
}

module.exports.getGasPrice = function(callback){
    try{
        log.info("getGasPrice");
        web3.eth.getGasPrice(function (error, data) {
            if (!error) {
                log.info("data: " + JSON.stringify(data));
                callback(false, data);
                return;
            }
            else{
                log.info('ERROR in getNodeInfo() ${error.message}');
                callback(true, error.message);
                return;
            }
        });
    }
    catch(e){
        log.info("Error in getGasPrice: "+ JSON.stringify(e));
    }
}

module.exports.isSyncing = function(callback){
    try{
        log.info("isSyncing");
        web3.eth.isSyncing(function( error, result ) {
            if(!error){
                log.info(result);
                callback(false, result);
                return;
            }
            else 
            {
                log.info("Please check if the node is sysncing: : ", error);
                callback(true, error.message);
                return;
            }
        });        
    }
    catch(e){
        log.info("Error in isSyncing: "+ JSON.stringify(e));
    }
}

module.exports.getSweepAccountBalance = function(callback)
{
    try{
        var totalBalance = 0.0;
        log.info("getSweepAccountBalance");
        web3.eth.getBalance(config.SweepAccount, function(err, balance){
            if (err) {
                // handle error
                log.info(err);
                totalBalance += 0;
                callback(true, totalBalance);
                return
            }

            totalBalance = (balance.toNumber()/config.centsPerEther);
            callback(false, totalBalance);
            return;
        });
    }
    catch(e){
        log.info("Error in getSweepAccountBalance: "+ JSON.stringify(e));
    }
}

module.exports.getWalletBalance = function(callback)
{
    try{
        log.info("getWalletBalance");
        var totalBalance = 0.0;
        web3.eth.getAccounts((err, res) => {
            if (err) {
                // handle error
                log.info(err);
                totalBalance += 0;
                callback(true, totalBalance);
                return
            }

            res.forEach( function(address,i){ 
                web3.eth.getBalance(address, function(err, balance){
                    if (err) {
                        // handle error
                        log.info(err);
                        totalBalance += 0;
                        callback(true, totalBalance);
                        return
                    }

                    totalBalance += (balance.toNumber()/config.centsPerEther);
                    if(i == res.length - 1){
                        log.info("totalBalance: " + totalBalance)
                        callback(false, totalBalance);
                        return;
                    }
                });
            });
        });
    }
    catch(e){
        log.info("Error in getWalletBalance: "+ JSON.stringify(e));
    }
}