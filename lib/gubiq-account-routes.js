var config = require('../config.js');
var gubiqRoutes = require("../lib/gubiq-routes.js");
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var web3-accounts = require('web3-eth-accounts');
var web3-personal = require('web3-eth-personal');

module.exports.getNewAddress = function(callback){

	console.log("getNewAddress");

	//Generate Address:
	web3-personal.newAccount(config.password, function( error, address ) {
    	if(!error){
    		console.log(address);
            callback(false, address);
            return;
    	else 
    	{
        	console.log("Something went wrong in getNewAddress: ", error);
        	callback(true, error.message);
    		return;
    	}
	});
}

module.exports.getBalance = function(address, callback){
	console.log("getBalances");
    var balance = 0.0;    
    web3.eth.getBalance(address, fucntion(error, result){
        if(!error){
    		console.log("Value in Hex " + result + " Decimal Value: "+ web3.utils.hexToNumber(result));
            balance = web3.utils.hexToNumber(result);
            callback(false, balance);
            return;
    	else 
    	{
        	console.log("Error in getting balance:: ", error);
        	callback(true, error);
    		return;
    	}                
    });
}

module.exports.getWalletBalances = function(addresses, callback)
{
    var totalBalance = 0;
    web3.eth.getAccounts((err, res) => {
	    
	    if (err) {
	        // handle error
	        console.log(err);
            totalBalance += 0;
            callback(true, totalBalance);
	        return
	    }
        
        balances = res.balances.map(function(address,i){ 
            web3.eth.getBalance(address, function(err, res){
                if (err) {
                    // handle error
                    console.log(err);
                    totalBalance += 0;
                    callback(true, totalBalance);
                    return
                }
                
                var balance = web3.utils.hexToNumber(res);
                totalBalance += balance;
            });
                callback(false, totalBalance);
	           return;
        });
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

module.exports.getDepositConfirmation = function(address, callback)
{
	console.log("getDepositConfirmation");
    //if count greater than 0 - deposit completed
    /*if (count > 0) {
        var res = new Response();
        res.TXID = hashes[0];
        res.Amount = (amount/config.centsPerToken);
        res.Status = config.DepositComplete;
        res.address = addresses;
        callback(false, res);
        return;
    }
    else {
        var res = new Response();
        res.TXID = hashes[0];
        res.Amount = (amount/config.centsPerToken);
        res.Status = config.DepositPending;
        res.address = addresses;
        callback(false, res);
        return;

    }
    else
    {
        var res = new Response();
        res.TXID = "";
        res.Amount = 0.000000;
        res.Status = "";
        res.address = addresses;
        callback(false, res);
    }*/
}

function Response()
{
    this.TXID = "";
    this.Amount = 0.0;
    this.Status = "";
    this.address = "";
}

module.exports.sendTransaction = function(fromAddress, toAddress, amount, callback){

	console.log("sendTransaction");
    var transactionObject = new Object();
    transactionObject.fromAddress = fromAddress;
    transactionObject.toAddress = toAddress;
    transactionObject.value = amount;
    transactionObject.gas = config.gas;
    gubiqRoutes.getGasPrice((err, result) =>{
        transactionObject.gasPrice = result;
        var sendTransaction = web3.eth.sendTransaction(transactionObject, config.password);
        sendTransaction.then(function(receipt){
            console.log("transaction id: "+ receipt);
            callback(false, receipt);
        });
        sendTransaction.once('transactionHash', function(hash){
            console.log("transactionHash: "+ hash);
            callback(false, receipt);
        });
        sendTransaction.once('receipt', function(receipt){         
            console.log("Transaction id: "+ receipt);
            callback(false, receipt); 
        });
        sendTransaction.on('confirmation', function(confNumber, receipt){
            console.log("confirmation: "+ receipt);
            var result = new Object();
            result.confNumber = confNumber;
            result.receipt = receipt;
            callback(false, result);
        });
        sendTransaction.on('error', function(error){ 
            console.log("error: "+ error);
            var result = new Object();
            callback(true, error);
        });
    });
    
}



