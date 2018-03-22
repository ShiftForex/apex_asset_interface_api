var http = require('http');
var request = require('request');
var config = require('../config.js');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://68.168.208.245:8589'));

module.exports.getNodeInfo = function(callback){

    try{
        console.log("getNodeInfo");
        console.log("before options");
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
        console.log("host: " + options.url);
        console.log("method: " + options.method);
        console.log("headers: " + JSON.stringify(options.headers));
        console.log("body: " + JSON.stringify(options.json));

        request(options, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log("data: " + JSON.stringify(data));
                callback(false, data);
                return;
            }
            else{
                console.log('ERROR in getNodeInfo() ${error.message}');
                callback(true, error.message);
                return;
            }
        });
    }
    catch(e)
    {
        console.log("Error in getNodeInfo: "+ JSON.stringify(e));
    }
}

module.exports.getBlockNumber = function(callback){
    try{
        console.log("getBlockNumber");
        var blockNumber = 0;
        web3.eth.getBlockNumber(function(err, blockNumber){
            if(err)
            {
                console.log("error: " + err);
                callback(true, err);
                return;
            }
            blockNumber = web3.utils.hexToNumber(blockNumber);
            callback(false, blockNumber);
            return;
        });
    }
    catch(e){
        console.log("Error in getBlockNumber: "+ JSON.stringify(e));
    }
}

module.exports.getAccounts = function(callback){
    try{
        console.log("getAccounts");
        var blockNumber = 0;
        web3.eth.getAccounts(function(err, accounts){
            if(err)
            {
                console.log("error: " + err);
                callback(true, err);
                return;
            }
            console.log("Accounts List: " + JSON.stringify(accounts));
            callback(false, accounts);
            return;
        });
    }
    catch(e){
        console.log("Error in getAccounts: "+ JSON.stringify(e));
    }
}

module.exports.getGasPrice = function(callback){
    try{
        console.log("getGasPrice");
        web3.eth.getGasPrice(function (error, data) {
            if (!error) {
                console.log("data: " + JSON.stringify(data));
                callback(false, data);
                return;
            }
            else{
                console.log('ERROR in getNodeInfo() ${error.message}');
                callback(true, error.message);
                return;
            }
        });
    }
    catch(e){
        console.log("Error in getGasPrice: "+ JSON.stringify(e));
    }
}

module.exports.isSyncing = function(callback){
    try{
        console.log("isSyncing");
        web3.eth.isSyncing(function( error, result ) {
            if(!error){
                console.log(result);
                callback(false, result);
                return;
            }
            else 
            {
                console.log("Please check if the node is sysncing: : ", error);
                callback(true, error.message);
                return;
            }
        });        
    }
    catch(e){
        console.log("Error in isSyncing: "+ JSON.stringify(e));
    }
}

module.exports.getSweepAccountBalance = function(callback)
{
    try{
        var totalBalance = 0.0;
        console.log("getSweepAccountBalance");
        web3.eth.getBalance(config.SweepAccount, function(err, balance){
            if (err) {
                // handle error
                console.log(err);
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
        console.log("Error in getSweepAccountBalance: "+ JSON.stringify(e));
    }
}

module.exports.getWalletBalance = function(callback)
{
    try{
        console.log("getWalletBalance");
        var totalBalance = 0.0;
        web3.eth.getAccounts((err, res) => {
            if (err) {
                // handle error
                console.log(err);
                totalBalance += 0;
                callback(true, totalBalance);
                return
            }

            res.forEach( function(address,i){ 
                web3.eth.getBalance(address, function(err, balance){
                    if (err) {
                        // handle error
                        console.log(err);
                        totalBalance += 0;
                        callback(true, totalBalance);
                        return
                    }

                    totalBalance += (balance.toNumber()/config.centsPerEther);
                    if(i == res.length - 1){
                        console.log("totalBalance: " + totalBalance)
                        callback(false, totalBalance);
                        return;
                    }
                });
            });
        });
    }
    catch(e){
        console.log("Error in getWalletBalance: "+ JSON.stringify(e));
    }
}