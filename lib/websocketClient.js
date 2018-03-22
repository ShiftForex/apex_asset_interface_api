var gubiqRoutes = require("../lib/gubiq-routes.js");
var gubiqAccountRoutes = require("../lib/gubiq-account-routes.js");
var config = require("../config.js");
var W3CWebSocket = require('websocket').w3cwebsocket;
var client = new W3CWebSocket(config.websocketURL);

var amsynchro = {};
var callsToGatherDeposits = 0;
amcid = 1;
var amconnected = true;
var TotalBalance = 0.0;

client.onerror = function () {
    console.log('Connection Error');
};

client.onopen = function () {
    console.log('WebSocket Client Connected');

    amconnected = true;
    Authenticate({ UserName: config.AMUserName, Password: config.AMUserPassword, AssetManagerID : config.AssetManagerID });
    gatherDeposits(callsToGatherDeposits);
    walletBalance();
};

client.onclose = function () {
    console.log('WebSocket Client Closed');
    amconnected = false;
};

client.onmessage = function (e) {
    console.log("Received: " + e);

    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }

    var frame = JSON.parse(e.data);
    var synchroCallBack = amsynchro[frame.i];
    //document.getElementById('resultdiv').innerHTML += ev.data + "<hr /><br />";
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
        console.log("Deposit completed Successfully");
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
    //client.send(f);

    gubiqAccountRoutes.getNewAddress(function (err, result) {
        if (err) {
            resp = {};
            frame.o = JSON.stringify(resp);
            f = JSON.stringify(frame);
            client.send(f);
            return;
        }
        else {
            console.log("getNewAddress details");
            console.log("Address: " + result);
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

    var resp = { ReplyObject: "", isSuccessful: true, ErrorMessage: "" };

    var toAddress = form.ExternalAddress;
    var value = parseFloat(ob.Amount);
    var comment = form.Comment;

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
    gubiqRoutes.getSweepAccountBalance(function (err, result) {
        if (err) {
            frame.o = JSON.stringify(hotBalance);
        }
        else {
            hotBalance = result;
			console.log("SweepAccount Balance: " + hotBalance);
            frame.o =  JSON.stringify(hotBalance);
        }
        var ret = JSON.stringify(frame);
		console.log(ret);
        client.send(ret);
    });

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
    console.log("GatherDeposits Counter: " + callsToGatherDeposits);
    var start = new Date().getTime();
    gubiqRoutes.getAccounts(function (err, result) {
		try{
			if(err){
				console.log("Error:", err.message);
			}
			if (result.length == 0) {
				console.log("waiting for deposits - New Address count is " + result.length);
			}
			var deposits = result.map(function(address) 
			{
				return new Promise(function(resolve, fail) 
				{
					gubiqAccountRoutes.getDepositConfirmation(address, function (err2, data) {
						if(err2){
							console.log("Error:", err2.message);
							fail("failed");
						}
						try {
							console.log(JSON.stringify(data));
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
								console.log("Deposit Status: " + data.Status + " for address: " + data.Address + " with value: " + data.Amount);
								if(data.Amount != 0){
									var frame = {};
									frame.m = 0;
									frame.i = amcid;
									amcid += 2;
									frame.n = "Deposit";
									var resp = { TransactionId: data.TXID, Address: data.Address, Amount: parseFloat(data.Amount), Status: data.Status };
									frame.o = JSON.stringify(resp);
									var f = JSON.stringify(frame);
									sendDeposit(f, function(err, result){
										if(err)
											console.log("Error in sending deposit info: " + err);
										else
											console.log("deposit info sent successfully: " + result);
									});
								}
								else{
									console.log("Waiting for deposit for address: " + data.Address);
									resolve("done");
								}
							}
							resolve("done");
						} catch (e) {
							console.log("Error in getting deposits for address: " + JSON.stringify(e));
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
			  console.log("Failed: ", err);
			});
		}
		catch (e) {
			console.log("Error in gatherDeposits: " + JSON.stringify(e));
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
        console.log("Result: " + JSON.stringify(successMessage));
        TotalBalance = successMessage.totalBalance;
        setTimeout(walletBalance, config.walletTimeInterval);
    });

    totalWalletBalance.catch(
        // Log the rejection reason
        (reason) => {
            console.log("The call to fetch the wallet balance failed" + reason.error);
            setTimeout(walletBalance, config.walletTimeInterval);
    });
    
}

wsHeartBeat = function(){
    var hearBeat = new Promise(function(resolve, fail) {
       if(amconnected == false){
            client = new W3CWebSocket('ws://localhost:14000/ws/');
        }
        resolve("connected");
    });
    
    hearBeat.then(
        function(successMessage){
            console.log("The WebSocket connection to Asset Manager is " + successMessage);
            setTimeout(wsHeartBeat, config.TimeInterval);
        }
    );
}