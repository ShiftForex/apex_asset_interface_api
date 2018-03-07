var config = require('../config.js');
var request = require('request');
var Web3 = require('web3');
var web3Provider = new Web3.providers.HttpProvider('http://68.168.208.245:8589')
var web3 = new Web3(web3Provider);
var web3P = require('web3-eth-personal');
var web3Personal = new web3P(web3Provider);

module.exports.getNewAddress = function(callback){

	try {
        console.log("getNewAddress");
        //Generate Address:
        web3Personal.newAccount(config.password, function( error, address ) {
            if(!error){
                console.log(address);
                callback(false, address);
                return;
            }
            else 
            {
                console.log("Something went wrong in getNewAddress: ", error);
                callback(true, error.message);
                return;
            }
        });
    } catch (e) {
        console.log("Error in getting a New Address: ", JSON.stringify(e));
    }
}

module.exports.getBalance = function(address, callback){
	try {
        console.log("getBalances");
        var balance = 0.0;    
        web3.eth.getBalance(address, function(error, result){
            if(!error){
                console.log("Value in Hex " + result + " Decimal Value: "+ (result/config.centsPerEther));
                balance = result/config.centsPerEther;
                callback(false, balance);
                return;
            }
            else 
            {
                console.log("Error in getting balance:: ", error);
                callback(true, error);
                return;
            }                
        });
    } catch (e) {
        console.log("Error in getting balance:: ", JSON.stringify(e));
    }
}

module.exports.getTransaction = function(transactionHash, callback){
	try {
        console.log("getTransaction");
        console.log("transaction: " + transactionHash);

        //Replay transaction:
        web3.eth.getTransaction(transactionHash, function( error, result ) {
            if(!error){
                console.log(result);
                callback(false, result);
                return;
            }
            else 
            {
                console.log("Something went wrong in getTransaction: ", error);
                callback(true, error.message);
                return;
            }
        });
    } catch (e) {
        console.log("Something went wrong in getTransaction: ", JSON.stringify(e));
    }
}

module.exports.sendTransaction = function(from, to, value, callback){
	try {
        console.log("sendTransaction");
        var transactionObject = new Object();
        transactionObject.from = from;
        transactionObject.to = to;
        transactionObject.value = value;
        transactionObject.gas = config.gas;
        web3.eth.getGasPrice(function (err, result){
            transactionObject.gasPrice = result;
            unlockAccount(from, config.SweepAccountPassphrase, function(err, result){
                if(result){
                    var sendTransaction = web3.eth.sendTransaction(transactionObject);
                    sendTransaction.then(function(receipt){
                        console.log("transaction id: "+ receipt);
                        callback(false, receipt);
                    });
                    /*sendTransaction.once('transactionHash', function(hash){
                    console.log("transactionHash: "+ hash);
                    callback(false, hash);
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
                });*/
                    sendTransaction.on('error', function(error){ 
                        console.log("error: "+ error);
                        callback(true, error);
                    });
                }
            });
        });
    } catch (e) {
        console.log("error in sendTransaction: "+ JSON.stringify(e));
    }
    
}

 var unlockAccount = function(account, passphrase, callback){
    try {
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
                method: "personal_unlockAccount",
                params: [account, passphrase]
            }
        };
        console.log("host: " + options.url);
        console.log("method: " + options.method);
        console.log("headers: " + JSON.stringify(options.headers));
        console.log("body: " + JSON.stringify(options.json));

        request(options, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log("data: " + JSON.stringify(data));
                callback(false, data.result);
            }
            else{
                console.log('ERROR in unlockAccount' + error);
                callback(false, error);
            }
        });
    } catch (e) {
        console.log('ERROR in unlockAccount' + JSON.stringify(e));
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
                console.log("Error getting blockNumber");
                callback(true, err);
                return;
            }
            currentBlockNum = result;
            if (startingBlocktoCheck == 0)
            {
                startingBlocktoCheck = currentBlockNum - 1000;
            }
            //setting the startingblock to check 20 blocks beyond the 1000
            //as a buffer to avoid skipping any deposits or withdraws.
            startingBlocktoCheck = startingBlocktoCheck - (reqConf + 5);
            callback(false, startingBlocktoCheck);
            return;
        });
    } catch (e) {
        console.log("Error getting blockNumber" + JSON.stringify(e));
    }
}


module.exports.getDepositConfirmation = function(account, callback)
{
	try {
        console.log("getDepositConfirmation");
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
            var accountBalance = web3.eth.getBalance(account);
            accountBalance.then(function(balance){
                if (account === config.SweepAccount)
                {
                    totalSweepAccountBalance = balance;
                    callback(false, "SweepAccount");
                    return;
                }
                // Potentially only find transactions within a configurable range from the current blockheight after initial sweep to reduce redundancy.
                var accountTransactions = [];
                getTransactionsByAccount(account, startingBlocktoCheck, currentBlockNum, function(err, result){
                    accountTransactions.push(result);
                    if (accountTransactions == null)
                    {
                        console.log("getTransactionsByAccount Failed! Not processing deposits!");
                        callback(false, null);
                        return;
                    }

                    accountTransactions.forEach(function (tx) 
                                                {
                        if (account == tx.to) 
                        {
                            var blocksElapsed = currentBlockNum - tx.blockNumber;
                            var value = tx.value;
                            var res = new Response();
                            if (blocksElapsed >= reqConf)
                            {
                                res.TXID = tx.hash;
                                res.Amount = value/config.centsPerEther;
                                res.Status = config.DepositComplete;
                                res.Address = account;
                                res.FromAddress = tx.from;
                                sweepBalToMainAccount(account, value);
                                callback(false, res);
                                return;
                            }
                            else
                            {
                                res.TXID = tx.hash;
                                res.Amount = value/config.centsPerEther;
                                res.Status = config.DepositPending;
                                res.Address = account;
                                res.FromAddress = tx.from;
                                callback(false, res);
                                return;
                            }
                        }
                    });
                });
            });  
        });
    } catch (e) {
        console.log("Exception in getDepositConfirmation " + JSON.stringify(e));
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
                    transactionObject.value = value;
                    transactionObject.gas = config.gas;
                    web3.eth.getGasPrice(function (err, result){
                        transactionObject.gasPrice = result;
                        unlockAccount(account, config.SweepAccountPassphrase, function(err, result){
                            if(result){
                                var sendTransaction = web3.eth.sendTransaction(transactionObject);
                                sendTransaction.then(function(receipt){
                                    console.log("transactionHash: "+ receipt);
                                    // keep track of recent transactions
                                    recentSweepTransactions.push(account);
                                    if (recentSweepTransactions.Count > 100)
                                    {
                                        recentSweepTransactions.pop();
                                    }
                                });
                                sendTransaction.on('error', function(error){ 
                                    console.log("Error transferring funds to sweep wallet: "+ error);
                                });
                            }
                        });
                    });
                }
            }
            catch (e)
            {
                console.log("Exception in Sweep " + JSON.stringify(e));
            }
        }
    } catch (e) {
        console.log("Exception in Sweep " + JSON.stringify(e));
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
          console.log("Using endBlockNumber: " + endBlockNumber);
      }
      if (startBlockNumber == null) {
          startBlockNumber = endBlockNumber - 1000;
          console.log("Using startBlockNumber: " + startBlockNumber);
      }
      console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

      for (var i = startBlockNumber; i <= endBlockNumber; i++) {
          if (i % 1000 == 0) {
              console.log("Searching block " + i);
          }
          var blocks = web3.eth.getBlock(i, true);
          blocks.then(function(block){
              if (block != null && block.transactions != null) {
                  block.transactions.forEach( function(tx) {
                      if (myaccount == tx.to)
                      {
                          console.log("tx hash : " + tx.hash + "\n"
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
          });
      }
  } catch (e) {
      console.log("Error in getTransactionsByAccount: "+ JSON.stringify(e));
  }
}