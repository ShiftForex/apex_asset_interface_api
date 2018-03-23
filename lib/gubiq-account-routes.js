var config = require('../config.js');
var request = require('request');
var Web3 = require('web3');
var web3Provider = new Web3.providers.HttpProvider(config.gubiqNetworkHost+":"+config.gubiqNetworkPort)
var web3 = new Web3(web3Provider);
var opts = {
    logDirectory: __dirname + '/../logs',
    fileNamePattern: 'gubiq_app-<date>.log',
    dateFormat:'YYYY.MM.DD-HHa'
};

const log = require('simple-node-logger').createRollingFileLogger( opts );

module.exports.getNewAddress = function(callback){

	try {
        log.info("getNewAddress");
        //Generate Address:
        web3.personal.newAccount(config.SweepAccountPassphrase, function( error, address ) {
            if(!error){
                log.info(address);
                callback(false, address);
                return;
            }
            else 
            {
                log.info("Something went wrong in getNewAddress: ", error);
                callback(true, error.message);
                return;
            }
        });
    } catch (e) {
        log.info("Error in getting a New Address: ", JSON.stringify(e));
    }
}

module.exports.getBalance = function(address, callback){
	try {
        log.info("getBalances");
        var balance = 0.0;    
        web3.eth.getBalance(address, function(error, result){
            if(!error){
                log.info("Value in Hex " + result.toNumber() + " Decimal Value: "+ (result.toNumber()/config.centsPerEther));
                balance = result/config.centsPerEther;
                callback(false, balance);
                return;
            }
            else 
            {
                log.info("Error in getting balance:: ", error);
                callback(true, error);
                return;
            }                
        });
    } catch (e) {
        log.info("Error in getting balance:: ", JSON.stringify(e));
    }
}

module.exports.getTransaction = function(transactionHash, callback){
	try {
        log.info("getTransaction");
        log.info("transaction: " + transactionHash);

        //Replay transaction:
        web3.eth.getTransaction(transactionHash, function( error, result ) {
            if(!error){
                log.info(result);
                callback(false, result);
                return;
            }
            else 
            {
                log.info("Something went wrong in getTransaction: ", error);
                callback(true, error.message);
                return;
            }
        });
    } catch (e) {
        log.info("Something went wrong in getTransaction: ", JSON.stringify(e));
    }
}

module.exports.sendTransaction = function(from, to, value, comment, callback){
    try {
        log.info("sendTransaction");
        var transactionObject = new Object();
        transactionObject.from = from;
        transactionObject.to = to;
        transactionObject.value = value*config.centsPerEther;
        transactionObject.gas = config.gas;
        web3.eth.getGasPrice(function (err, result){
            transactionObject.gasPrice = result.toNumber();

            unlockAccount(from, config.password, function(err, data, result){
                if(result !== undefined && result){
                    web3.eth.sendTransaction(transactionObject, function(err, hash){
                        if(!err)
                        {
                            log.info("transactionHash: "+ hash);
                            callback(false, hash);							
                        }
                        else
                        {
                            log.info("error: "+ err);
                            callback(true, err);							
                        }
                    });
                }
                else
                {
                    log.info("error: "+ err);
                    callback(true, data.error);
                }
            });
        });
    } 
    catch (e) {
        log.info("error in sendTransaction: "+ JSON.stringify(e));
    }
}

 var unlockAccount = function(account, passphrase, callback){
    try {
        log.info("unlockAccount");
        var options = {
            url: config.gubiqNetworkHost+":"+config.gubiqNetworkPort,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json:{
                id: 1, 
                jsonrpc:"2.0",
                method: "personal_unlockAccount",
                params: [account, passphrase]
            }
        };
        log.info("host: " + options.url);
        log.info("method: " + options.method);
        log.info("headers: " + JSON.stringify(options.headers));
        log.info("body: " + JSON.stringify(options.json));

        request(options, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                log.info("data: " + JSON.stringify(data));
                callback(false, data, data.result);
            }
            else{
                log.info('ERROR in unlockAccount' + error);
                callback(true, data, error);
            }
        });
    } catch (e) {
        log.info('ERROR in unlockAccount' + JSON.stringify(e));
    }
}

var currentBlockNum = 0;
var totalSweepAccountBalance = 0;
var recentSweepTransactions = [];
function getStartingBlock(reqConf, callback)
{
    try {
        var startingBlocktoCheck = currentBlockNum;
        web3.eth.getBlockNumber( function(err, result){
            if(err)
            {
                log.info("Error getting blockNumber");
                callback(true, err);
                return;
            }
            currentBlockNum = result;
            if (startingBlocktoCheck == 0)
            {
                startingBlocktoCheck = currentBlockNum - 100;
            }
            //setting the startingblock to check 20 blocks beyond the 1000
            //as a buffer to avoid skipping any deposits or withdraws.
            startingBlocktoCheck = startingBlocktoCheck - (reqConf + 5);
            callback(false, startingBlocktoCheck);
            return;
        });
    } catch (e) {
        log.info("Error getting blockNumber" + JSON.stringify(e));
    }
}

module.exports.getDepositConfirmation = function(account, callback)
{
	try {
		if (account.toLowerCase() === config.SweepAccount.toLowerCase())
		{
			var res = new Response();
			res.TXID = "";
			res.Amount = 0.000000;
			res.Status = "";
			res.Address = account;
			res.FromAddress = "";
			callback(false, res);
			return;
		}
        var reqConf = config.DepositConfirmations;
        var startingBlocktoCheck = 0;
        getStartingBlock(reqConf, function(err, result){
            if(err)
            {
                callback(true, err);
                return;
            }
            startingBlocktoCheck = result;
            if (startingBlocktoCheck === currentBlockNum){
                callback(true, "The Starting Block and the Current Block are the same");
                return;
            }

            // Potentially only find transactions within a configurable range from the current blockheight after initial sweep to reduce redundancy.
            var accountTransactions = [];
            getTransactionsByAccount(account, startingBlocktoCheck, currentBlockNum, function(err, result){
                if(result == null){
                    var res = new Response();
                    res.TXID = "";
                    res.Amount = 0.000000;
                    res.Status = "";
                    res.Address = account;
                    res.FromAddress = "";
                    callback(false, res);
                    return;
                }
                accountTransactions.push(result);
                if (accountTransactions == null)
                {
                    log.info("getTransactionsByAccount Failed! Not processing deposits!");
                    callback(false, null);
                    return;
                }

                accountTransactions.forEach(function (tx){
                    if(tx !== null){
                        if (account == tx.to){
                            var blocksElapsed = currentBlockNum - tx.blockNumber;
                            var value = tx.value;
                            var res = new Response();
                            if (blocksElapsed >= reqConf){
                                res.TXID = tx.hash;
                                res.Amount = value/config.centsPerEther;
                                res.Status = config.DepositComplete;
                                res.Address = account;
                                res.FromAddress = tx.from;
                                sweepBalToMainAccount(account, value);
                                callback(false, res);
                                return;
                            }
                            else{
                                res.TXID = tx.hash;
                                res.Amount = value/config.centsPerEther;
                                res.Status = config.DepositPending;
                                res.Address = account;
                                res.FromAddress = tx.from;
                                callback(false, res);
                                return;
                            }
                        }
                    }
                    else{
                        web3.eth.getBalance(account, function(err, result){
                            if(result.toNumber() > 0)
                            {
                                log.info("Account Balance "+ (result.toNumber()/config.centsPerEther) + " transferred to sweep account");
                                sweepBalToMainAccount(account, result.toNumber());
                            }	
                        });
                    }
                });
            });
        });
    } catch (e) {
        log.info("Exception in getDepositConfirmation " + JSON.stringify(e));
    }
}

function sweepBalToMainAccount(account, value){
    try {
        if(value > 0)
        {
            try
            {
                if (!recentSweepTransactions.includes(account))
                {
                    var transactionObject = new Object();
                    transactionObject.from = account;
                    transactionObject.to = config.SweepAccount;
                    transactionObject.gas = config.gas;
                    web3.eth.getGasPrice(function (err, result){
                        transactionObject.gasPrice = result;
						transactionObject.value = value - (transactionObject.gas * transactionObject.gasPrice)
                        unlockAccount(account, config.password, function(err, data, result){
                            if(result !== undefined && result){
                                web3.eth.sendTransaction(transactionObject, function(err, hash){
									if(err){
										log.info("Error transferring funds to sweep wallet: "+ err);
									} else{
										log.info("transactionHash: "+ hash);
										// keep track of recent transactions
										recentSweepTransactions.push(account);
										if (recentSweepTransactions.Count > 100)
										{
											recentSweepTransactions.pop();
										}
									}
								});
                            }
                            else{
                                log.info("error: "+ data.error);
                            }
                        });
                    });
                }
            }
            catch (e)
            {
                log.info("Exception in Sweep " + JSON.stringify(e));
            }
        }
    } catch (e) {
        log.info("Exception in Sweep " + JSON.stringify(e));
    }
}

function Response()
{
    this.TXID = "";
    this.Amount = 0.0;
    this.Status = "";
    this.Address = "";
    this.FromAddress = "";
}

function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber, callback) {
	try {
		if (endBlockNumber == null) {
			endBlockNumber = web3.eth.blockNumber;
			log.info("Using endBlockNumber: " + endBlockNumber);
		}
		if (startBlockNumber == null) {
			startBlockNumber = endBlockNumber - 1000;
			log.info("Using startBlockNumber: " + startBlockNumber);
		}
		log.info("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

		for (var i = startBlockNumber; i <= endBlockNumber; i++) {
			if (i % 1000 == 0) {
              log.info("Searching block " + i);
			}
			if (i == endBlockNumber) {
              log.info("Searching latest block " + i);
			}
			
			if (!web3.isConnected()) {
				log.info('no web3 connection.');
				web3 = new Web3(web3Provider);
				callback(true, null);
				return;
			} else {
			  	web3.eth.getBlock(i, true, function(err, block) {
					if (block != null && block.transactions != null) {
						block.transactions.forEach( function(tx) {
							if (myaccount == tx.to)
							{
								log.info("tx hash : " + tx.hash + "\n"
								  + "   nonce           : " + tx.nonce + "\n"
								  + "   blockHash       : " + tx.blockHash + "\n"
								  + "   blockNumber     : " + tx.blockNumber + "\n"
								  + "   transactionIndex: " + tx.transactionIndex + "\n"
								  + "   from            : " + tx.from + "\n" 
								  + "   to              : " + tx.to + "\n"
								  + "   value           : " + tx.value + "\n"
								  + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
								  + "   gasPrice        : " + tx.gasPrice + "\n"
								  + "   gas             : " + tx.gas + "\n"
								  + "   input           : " + tx.input);
								callback(false, tx);
								return;
							}
						});
					} 
					else {
						log.info(err);
						callback(true, null);
						return;
					}
				});
			}
		}
		callback(false, null);
		return;
	} 
	catch (e) {
		log.info("Error in getTransactionsByAccount: "+ JSON.stringify(e));
	}
}