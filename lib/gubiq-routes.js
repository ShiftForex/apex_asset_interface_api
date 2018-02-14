var http = require('http');
var request = require('request');
var config = require('../config.js');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var web3-accounts = require('web3-eth-accounts');
var web3-personal = require('web3-eth-personal');

module.exports.getBlockNumber = function(callback){

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
    })
}

module.exports.getGasPrice = function(callback){

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

module.exports.isSyncing = function(command, callback){

    console.log("listAccounts");
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

module.exports.getTransaction = function(transactionHash, callback){

	console.log("getTransaction");
    console.log("transaction: " + transaction);

	//Replay transaction:
	web3.eth.getTransaction(transactionHash, function( error, result ) {
        if(!error){
            console.log(result);
            callback(false, result);
            return;
        }
        else 
        {
            console.log("Something went wrong in replayBundle: ", error);
            callback(true, error.message);
            return;
        }
	});
}

module.exports.getBundle = function(transaction, callback){

	console.log("getBundle");
    console.log("transaction: " + transaction);

	//get Bundle:
	iotajs.api.getBundle(transaction, function( error, result ) {
        if(!error){
            console.log(result);
            callback(false, result);
            return;
        }
        else 
        {
            console.log("Something went wrong in replayBundle: ", error);
            callback(true, error.message);
            return;
        }
	});
}

module.exports.getWalletBalance = function(callback){

	console.log("getWalletBalance");
    /*  start: int Starting key index
        end: int Ending key index
        security: Int Security level to be used for the private key / address. Can be 1, 2 or 3
    */
    database.getlatestIndex(config.countersCol, function(err, latestKeyIndex){
        if(err){
            console.log(err);
            callback(false, err);
            return;
        }
        var options = {
		start: 0,
        end: latestKeyIndex + 1,
		security: config.security
        };
        //Get Wallet Balance:
        iotajs.api.getInputs(config.seed, options, function( error, result ) {
            if(!error){
                console.log(result);
                callback(false, result.totalBalance);
                return;
            }
            else 
            {
                console.log("Something went wrong in replayBundle: ", error);
                callback(true, error.message);
                return;
            }
        });
    });
}

module.exports.getInputs = function(callback){

	console.log("getInputs");
    /*  start: int Starting key index
        end: int Ending key index
        security: Int Security level to be used for the private key / address. Can be 1, 2 or 3
    */
    database.getlatestIndex(config.countersCol, function(err, latestKeyIndex){
        if(err){
            console.log(err);
            callback(false, err);
            return;
        }
        var options = {
		start: 0,
        end: latestKeyIndex + 1,
		security: config.security
        };
        //Get Wallet Balance:
        iotajs.api.getInputs(config.seed, options, function( error, result ) {
            if(!error){
                console.log(result);
                callback(false, result.inputs);
                return;
            }
            else 
            {
                console.log("Something went wrong in replayBundle: ", error);
                callback(true, error.message);
                return;
            }
        });
    });
}

