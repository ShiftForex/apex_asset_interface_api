var appRouter = function(app) {

    var gubiqAccount = require("../lib/gubiq-account-routes.js")
    var config = require("../config.js");

    app.post("/getNewAddress", function(req, res) {

        console.log("getNewAddress");
        console.log(req.body);
        var method = req.body.method;

        if(method != 'getNewAddress' || method === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }
        
        gubiqAccount.getNewAddress(function(err,result){
            if(err) {
                res.status(401).send({msg: result}); 
                return;
            }
            else{
                console.log("getNewAddress details");
                console.log(result);
                res.status(200).send({address: result}); 
                return;
            }
        });
    });

    app.post("/getBalance", function(req, res) {

        console.log("getBalance");
        console.log(req.body);
        var method = req.body.method;
        var address = req.body.address;
        
        if(method != 'getBalance' || method === null)
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }
        
        if(address === null)
        {
            res.status(401).send({ msg: "Address is required!!"}); 
            return;
        }
    
        gubiqAccount.getBalance(address, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                console.log("getBalances: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });

    app.post("/getTransaction", function(req, res) {

        console.log("getTransaction");
        console.log(req.body);
        var method = req.body.method;
        var transactionHash = req.body.transactionHash;

        if(method != 'getTransaction')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiqAccount.getTransaction(transactionHash, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else
            {
                console.log("Transactions: " + JSON.stringify(result));
                res.status(200).send({result});
                return;
            }
        });
    });
    
    app.post("/getDepositConfirmation", function(req, res) {

        console.log("getDepositConfirmation");
        console.log(req.body);
        var method = req.body.method;
        var address = req.body.address;

        if(method != 'getDepositConfirmation')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiqAccount.getDepositConfirmation(address, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                console.log("getDepositConfirmation details");
                console.log(result);
                res.status(200).send({result: result});
                return;
            }
        });
    });
    
    app.post("/sendTransaction", function(req, res) {

        console.log("sendTransaction");
        console.log(req.body);
        var method = req.body.method;
        var accountId = req.body.accountId;
        var toAddress = req.body.toAddress;
        var fromAddress = req.body.fromAddress;
        var value = parseFloat(req.body.value) * config.centsPerEther;
        var comment = req.body.comment;
        
        if(method != 'sendTransaction')
        {
            res.status(401).send({ msg: "Invalid function!!"}); 
            return;
        }

        gubiqAccount.sendTransaction(fromAddress, toAddress, value, function(err,result){
            if(err) {
                res.status(401).send({ msg: result}); 
                return;
            }
            else{
                console.log("sendTransfer details");
                console.log(result);
                res.status(200).send({result: result});
                return;
            }
        });
    });
	
	app.post("/sendDeposit", function(req, res) {

		console.log("sendDeposit");
		console.log(req.body);
		var method = req.body.method;
		var payload = req.body.params[0];

		if(method != 'sendDeposit')
		{
			res.status(401).send({ msg: "Invalid function!!"}); 
			return;
		}

		websocketRoutes.payload(address, function(err,result){
			if(err) {
				res.status(401).send({ msg: "Failed"}); 
				return;
			}
			else{
				res.status(200).send({result: result});
				return;
			}
		});
    });
}

module.exports = appRouter;
