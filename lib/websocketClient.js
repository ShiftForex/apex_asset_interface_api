var gubiqRoutes = require("../lib/gubiq-routes.js");
var gubiqAccountRoutes = require("../lib/gubiq-account-routes.js");
var config = require("../config.js");
var W3CWebSocket = require('websocket').w3cwebsocket;

//var client = new W3CWebSocket(config.websocketURL);
const log = require('simple-node-logger').createRollingFileLogger( config.logOptions );

var amsynchro = {};
var callsToGatherDeposits = 0;
amcid = 1;
var amconnected = false;
var TotalBalance = 0.0;
var sweepAccountBalance = 0.0;
var heartBeatTimerOn = false;

onerror = function () {
    log.info('Connection Error');
};

onopen = function () {
    log.info('WebSocket Client Connected');
    Authenticate({ UserName: config.AMUserName, Password: config.AMUserPassword, AssetManagerId : config.AssetManagerID });
	if (heartBeatTimerOn === false) {
		wsHeartBeat();
		heartBeatTimerOn = true;
	}
    gatherDeposits(callsToGatherDeposits);
    walletBalance();
};

onclose = function () {
    log.info('WebSocket Client Closed');
};

onmessage = function (e) {
    //log.info("onmessage received: " + e);

    if (typeof e.data === 'string') {
        log.info("Received string: '" + e.data + "'");
    }

    var frame = JSON.parse(e.data);
    var synchroCallBack = amsynchro[frame.i];
	
    if (synchroCallBack === undefined) {
    }
    else {
        if (frame.o == '') {
            synchroCallBack({});
        }
        else {
            synchroCallBack(JSON.parse(frame.o));
        }
        delete amsynchro[frame.i];
    }
    if (frame.n == "GetWithdrawFormTemplateTypes") {
        GetWithdrawFormTemplateTypes(frame.o, frame.i);
    }
    if (frame.n == "Deposit") {
        log.info("Deposit completed Successfully");
    }
    else if (frame.n == "GetWithdrawFormTemplate") {
        GetWithdrawFormTemplate(frame.o, frame.i);
    }
    else if (frame.n == "SubmitWithdrawForm") {
        SubmitWithdrawForm(frame.o, frame.i);
    }
    else if (frame.n == "CreateNewDepositKey") {
        CreateNewDepositKey(frame.o, frame.i);
    }
    else if (frame.n == "GetDepositRequestInfoTemplate") {
        GetDepositRequestInfoTemplate(frame.o, frame.i);
    }
    else if (frame.n == "CallbackNotify") {
        CallbackNotify(frame.o, frame.i);
    }
    else if (frame.n == "GetBalanceOf") {
        GetBalance(frame.o, frame.i);
    }
    else if (frame.n == "GetTotalBalance") {
        GetTotalBalance(frame.o, frame.i);
    }
    else if (frame.n == "GetProviderDetails") {
        GetProviderDetails(frame.o, frame.i);
    }
    else if (frame.n == "GetProviderAdminFunctionList") {
        GetProviderAdminFunctionList(frame.o, frame.i);
    }
    else if (frame.n == "ExecuteProviderAdminFunction") {
        ExecuteProviderAdminFunction(frame.o, frame.i);
    }
};

function reconnect(){
	client = new W3CWebSocket(config.websocketURL);
	client.onerror = onerror;
	client.onopen = onopen;
	client.onmessage = onmessage;
	client.onclose = onclose;
	log.info("Creating a new client!!")
}

reconnect();

//this synchronizes the requests with the responses so that your requesting function receives the correct resultset
//use this whenever there's a possibility of more than one request for the same call from different functions
amSynchroCall = function(remoteFunction, payload, callback) {
    var frame = new APService.ANWSFrame();
    frame.m = 0;
    frame.i = this.amcid;
    amsynchro[this.amcid] = callback;
    frame.n = remoteFunction;
    frame.o = JSON.stringify(payload);
    var f = JSON.stringify(frame);
    client.send(f);
    am_parent.amcid += 2;
};


Authenticate = function(req) {
    var frame = {};
    frame.m = 0;
    frame.i = this.amcid;
    frame.n = "Authenticate";
    frame.o = JSON.stringify(req);
    var f = JSON.stringify(frame);
    client.send(f);

    amcid += 2;
};


CreateNewDepositKey = function(o, i) {
    var ob = JSON.parse(o);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    var resp;
    var f;

    gubiqAccountRoutes.getNewAddress(function (err, result) {
        if (err) {
            resp = {};
            frame.o = JSON.stringify(resp);
            f = JSON.stringify(frame);
            client.send(f);
            return;
        }
        else {
            log.info("getNewAddress details");
            log.info("Address: " + result);
            resp = { DepositKey: result };
            frame.o = JSON.stringify(resp);
            f = JSON.stringify(frame);
            client.send(f);
            return;
        }
    });
}

GetWithdrawFormTemplateTypes = function(o, i) {
    var ob = JSON.parse(o);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetWithdrawFormTemplateTypes";

    var resp = { TemplateTypes: [] };
    resp.TemplateTypes.push("ToExternalUBIQAddress");

    frame.o = JSON.stringify(resp);
    var f = JSON.stringify(frame);
    client.send(f);
}


GetWithdrawFormTemplate = function(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetWithdrawFormTemplate";

    var resp = { ExternalAddress: "", Comment: "", TemplateType: "ToExternalUBIQAddress" };

    frame.o = JSON.stringify(resp);
    var f = JSON.stringify(frame);

    client.send(f);
}

SubmitWithdrawForm = function(o, i) {

    var ob = JSON.parse(o);
    var form = JSON.parse(ob.Form);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "SubmitWithdrawForm";
    var resp = new Object();
    resp.ReplyObject = ""; 
    resp.isSuccessful = true; 
    resp.ErrorStr = "";
    
    if(ob.Type !== "ToExternalUBIQAddress")
    {
        resp.isSuccessful = false;
        resp.ErrorStr = "Invalid Template type";
        frame.o = JSON.stringify(resp);
        client.send(JSON.stringify(frame));
    }
    else if(form.ExternalAddress === undefined || form.ExternalAddress == "" || form == "{}")
    {
        resp.isSuccessful = false;
        resp.ErrorStr = "ExternalAddress cannot be null or empty";
        frame.o = JSON.stringify(resp);
        client.send(JSON.stringify(frame));
    }
    else if(ob.Amount === undefined || ob.Amount == null || ob.Amount == ""){
        resp.isSuccessful = false;
        resp.ErrorStr = "Amount cannot be null or empty";
        frame.o = JSON.stringify(resp);
        client.send(JSON.stringify(frame));
    }

    var toAddress = form.ExternalAddress;
    var value = parseFloat(ob.Amount);
    var comment = form.Comment;

    if(sweepAccountBalance < value)
    {
        resp.isSuccessful = false;
        resp.ErrorStr = "Sweep Account balance is insufficient!!";
        frame.o = JSON.stringify(resp);
        client.send(JSON.stringify(frame));
    }
    
    gubiqAccountRoutes.sendTransaction(config.SweepAccount, toAddress, value, comment, function (err, result) {
        if (err) {
            resp.isSuccessful = false;
            resp.ErrorStr = JSON.stringify(result);
        }
        else {
            resp.isSuccessful = true;
            resp.ReplyObject = JSON.stringify(result);
            resp.ErrorStr = ""; 
        }
        frame.o = JSON.stringify(resp);
        client.send(JSON.stringify(frame));
    });
}

GetDepositRequestInfoTemplate = function(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetDepositRequestInfoTemplate";
    frame.o = "";
    var f11 = JSON.stringify(frame);
    client.send(f11);
}

CallbackNotify = function(o, i) {
    var f = {};
    f.IsSuccessful = true;
    f.ErrorStr = "";
    f.ReplyObject = "{}";

    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "CallbackNotify";
    frame.o = JSON.stringify(f);
    var ret = JSON.stringify(frame);

    client.send(ret);
}

GetTotalBalance = function(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetTotalBalance";
	var hotBalance = 0.0;
    try{
        gubiqRoutes.getSweepAccountBalance(function (err, result) {
            if (err) {
                frame.o = JSON.stringify(hotBalance);
            }
            else {
                hotBalance = result;
                log.info("SweepAccount Balance: " + hotBalance);
                sweepAccountBalance = hotBalance;
                frame.o =  JSON.stringify(hotBalance);
            }
            var ret = JSON.stringify(frame);
            log.info(ret);
            client.send(ret);
        });
    }
    catch(e){
        log.error("Error in getTotalBalance" + JSON.stringify(e));
    }

}

GetBalance = function(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetBalance";

    gubiqRoutes.getBalance(o , function (err, result) {
        if (err) {
            frame.o = 0;
        }
        else {
            var amt = JSON.parse(result);;
            frame.o = amt;
        }
        var ret = JSON.stringify(frame);
        client.send(ret);
    });
}

GetProviderDetails = function(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetProviderDetails";
    var res = new Object();

    gubiqRoutes.getAccounts(function (err, result) {
		res.NumAccounts = result.length;
		gubiqRoutes.getSweepAccountBalance(function (err, result) {
			
			res.SweepAccountBal = result;
			res.GasLimit = config.gas;
			res.TotalWalletBal = TotalBalance;
			//res.ColdWalletBal = totalColdWalletBalance;
			
			frame.o = JSON.stringify(res);
			var ret = JSON.stringify(frame);
			client.send(ret);
		});
    });
}


ExecuteProviderAdminFunction = function(o, i) {
    var ob = JSON.parse(o);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "ExecuteProviderAdminFunction";
    frame.o = "Invalid Function";
    var f = JSON.stringify(frame);
    client.send(f);
}

GetProviderAdminFunctionList = function(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetProviderAdminFunctionList";

    var functioncollection = [];
    
    frame.o = JSON.stringify(functioncollection);
    var ret = JSON.stringify(frame);
    client.send(ret);
}

function gatherDeposits(arg)
{
    callsToGatherDeposits++;
    log.info("GatherDeposits Counter: " + callsToGatherDeposits);
    var start = new Date().getTime();
    gubiqRoutes.getAccounts(function (err, result) {
		try{
			if(err){
				log.info("Error:", err.message);
			}
			if (result.length == 0) {
				log.info("waiting for deposits - New Address count is " + result.length);
			}
			var deposits = result.map(function(address) 
			{
				return new Promise(function(resolve, fail) 
				{
					gubiqAccountRoutes.getDepositConfirmation(address, function (err2, data) {
						if(err2){
							log.info("Error:", err2.message);
							fail("failed");
						}
						try {
							log.info(JSON.stringify(data));
							if (data.Status == "Complete" && (data.Address == address)) {
								var frame = {};
								frame.m = 0;
								frame.i = amcid;
								amcid += 2;
								frame.n = "Deposit";
								var resp = { TransactionId: data.TXID, Address: data.Address, Amount: parseFloat(data.Amount), Status: data.Status };
								frame.o = JSON.stringify(resp);
								var f = JSON.stringify(frame);
								client.send(f);
							}
							else{
								log.info("Deposit Status: " + data.Status + " for address: " + data.Address + " with value: " + data.Amount);
								if(data.Amount != 0){
									var frame = {};
									frame.m = 0;
									frame.i = amcid;
									amcid += 2;
									frame.n = "Deposit";
									var resp = { TransactionId: data.TXID, Address: data.Address, Amount: parseFloat(data.Amount), Status: data.Status };
									frame.o = JSON.stringify(resp);
									var f = JSON.stringify(frame);
									client.send(f);
								}
								else{
									log.info("Waiting for deposit for address: " + data.Address);
									resolve("done");
								}
							}
							resolve("done");
						} catch (e) {
							log.info("Error in getting deposits for address: " + JSON.stringify(e));
							fail("failed");
						}finally{
							resolve("done");
						}
					});
				})
			}, this)

			Promise.all(deposits).then(function(){
				setTimeout(gatherDeposits, config.TimeInterval)
			}).catch(function(err) {
			  // catch any error that happened so far
			  log.info("Failed: ", err);
			});
		}
		catch (e) {
			log.info("Error in gatherDeposits: " + JSON.stringify(e));
		}
    });
}

function walletBalResult(){
    this.totalBalance = 0.0;
    this.error = "";
}

walletBalance = function(){
    
    var totalWalletBalance = new Promise(function(resolve, fail) {
        var res = new walletBalResult();
        gubiqRoutes.getWalletBalance(function (err, result) {
            if (err) {
                res.error = err;
                res.totalBalance = 0.0;
                fail(res);
            }
            else {
                res.error = "";
                res.totalBalance = result;
                resolve(res)
            }
        });
    });

    totalWalletBalance.then(
        function (successMessage){
        // successMessage is whatever we passed in the resolve(...) function above.
        successMessage.totalBalance = successMessage.totalBalance;
        log.info("Result: " + JSON.stringify(successMessage));
        TotalBalance = successMessage.totalBalance;
        setTimeout(walletBalance, config.walletTimeInterval);
    });

    totalWalletBalance.catch(
        // Log the rejection reason
        (reason) => {
            log.info("The call to fetch the wallet balance failed" + reason.error);
            setTimeout(walletBalance, config.walletTimeInterval);
    });
    
}

function wsHeartBeat(){
    var hearBeat = new Promise(function(resolve, fail) {
		try{
			if(client._connection != undefined && client._connection.connected){
				var frame = {};
				frame.m = 0;
				frame.i = amcid;
				amcid += 2;
				frame.n = "Ping";
				frame.o = "";
				var f = JSON.stringify(frame);
				client.send(f);
			}
			else{
				if(client._connection != undefined)
					client._connection.drop(1001);
				reconnect();
			}
			setTimeout(wsHeartBeat, config.TimeInterval);
		}
		catch(e){
			log.error(e);
			fail("failed")
		}
    });
    
    hearBeat.catch(
        function(reason){
			log.info("The WebSocket connection to Asset Manager is not connected");
			setTimeout(wsHeartBeat, config.TimeInterval);
        }
    );
	
	process.on('unhandledRejection', error => {
		client = null;
		log.error('unhandledRejection', error);
	});
}