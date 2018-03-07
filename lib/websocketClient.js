var gubiqRoutes = require("../lib/gubiq-routes.js");
var gubiqAccountRoutes = require("../lib/gubiq-account-routes.js");
var config = require("../config.js");
var database = require("../lib/database.js");
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
function amSynchroCall(remoteFunction, payload, callback) {
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


function Authenticate(req) {
    var frame = {};
    frame.m = 0;
    frame.i = this.amcid;
    frame.n = "Authenticate";
    frame.o = JSON.stringify(req);
    var f = JSON.stringify(frame);
    client.send(f);

    amcid += 2;
};


function CreateNewDepositKey(o, i) {
    var ob = JSON.parse(o);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    var resp;
    var f;
    //client.send(f);

    var index = database.createNewIndex(function (err, index) {
        if (err) {
            //res.status(401).send({ msg: index});
            resp = {};
            frame.o = JSON.stringify(resp);
            f = JSON.stringify(frame);
            client.send(f);
            return;
        }
        else {
            var type = config.depositAddress;
            if (index != null) {
                gubiqAccountRoutes.getNewAddress(config.seed.toUpperCase(), index, type, function (err, result) {
                    if (err) {
                        //res.status(401).send({msg: result}); 
                        resp = {};
                        frame.o = JSON.stringify(resp);
                        f = JSON.stringify(frame);
                        client.send(f);
                        return;
                    }
                    else {
                        console.log("getNewAddress details");
                        console.log("Address: " + result + " keyIndex: " + index);
                        //res.status(200).send({address: result});
                        resp = { DepositKey: result };
                        frame.o = JSON.stringify(resp);
                        f = JSON.stringify(frame);
                        client.send(f);
                        return;
                    }
                });
            }
        }
    });
}


function GetWithdrawFormTemplateTypes(o, i) {
    var ob = JSON.parse(o);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetWithdrawFormTemplateTypes";

    var resp = { TemplateTypes: [] };
    resp.TemplateTypes.push("ToExternalIOTAAddress");

    frame.o = JSON.stringify(resp);
    var f = JSON.stringify(frame);
    client.send(f);
}


function GetWithdrawFormTemplate(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetWithdrawFormTemplate";

    var resp = { ExternalAddress: "", Comment: "", TemplateType: "ToExternalIOTAAddress" };

    frame.o = JSON.stringify(resp);
    var f = JSON.stringify(frame);

    client.send(f);
}

function SubmitWithdrawForm(o, i) {

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

    gubiqAccountRoutes.withdraw(toAddress, value, comment, '', function (err, result) {
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



function GetDepositRequestInfoTemplate(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetDepositRequestInfoTemplate";
    frame.o = "";
    var f11 = JSON.stringify(frame);
    client.send(f11);
}

function CallbackNotify(o, i) {
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

function GetTotalBalance(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetTotalBalance";

    frame.o =  JSON.stringify(TotalBalance);
    var ret = JSON.stringify(frame);
    client.send(ret);
    /*gubiqRoutes.getWalletBalance(function (err, result) {
        if (err) {
            frame.o = "0";
        }
        else {
            frame.o = result;
        }
        var ret = JSON.stringify(frame);
        client.send(ret);
    });*/

}

function GetBalance(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetBalance";

    gubiqAccountRoutes.getBalances('getBalances', '[' + o + ']', config.threshold, function (err, result) {
        if (err) {
            frame.o = 0;
        }
        else {
            var retObj = JSON.parse(result);
            var amt = retObj.balances[0];
            frame.o = amt;
        }
        var ret = JSON.stringify(frame);
        client.send(ret);
    });
}

function GetProviderDetails(o, i) {
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "GetProviderDetails";
    var details = new Object();

    gubiqRoutes.getNodeInfo('getNodeInfo', function (err, result) {
        details.latestMilestoneIndex = result.latestMilestoneIndex;
        details.latestSolidSubtangleMilestoneIndex = result.latestSolidSubtangleMilestoneIndex;
        details.latestMilestone = result.latestMilestone;
        details.latestSolidSubtangleMilestone = result.latestSolidSubtangleMilestone;
        details.appVersion = result.appVersion;
        details.neighbors = result.neighbors;
        details.totalBalance = TotalBalance;
        frame.o = JSON.stringify(details);
        var ret = JSON.stringify(frame);
        client.send(ret);
    });
}


function ExecuteProviderAdminFunction(o, i) {
    var ob = JSON.parse(o);
    var frame = {};
    frame.m = 1;
    frame.i = i;
    frame.n = "ExecuteProviderAdminFunction";
    frame.o = "Invalid Function";
    var f = JSON.stringify(frame);
    client.send(f);
}

function GetProviderAdminFunctionList(o, i) {
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
    database.getAllAddresses(function (err, result) {
        if (result.length == 0) {
            console.log("waiting for deposits - New Address count is " + result.length);
        }
        var deposits = result.map(function(element) 
        {
            return new Promise(function(resolve, fail) 
            {
                var addressArray = new Array();
                addressArray.push(element.address);
                gubiqAccountRoutes.getDepositConfirmation(addressArray, function (err2, data) {
                    console.log(JSON.stringify(data));
                    if (data.Status == "Complete" && (data.address[0] == element.address && element.status == "Complete")) {
                        var frame = {};
                        frame.m = 0;
                        frame.i = amcid;
                        amcid += 2;
                        frame.n = "Deposit";
                        var resp = { TransactionId: data.TXID, Address: data.address[0], Amount: parseFloat(data.Amount), Status: data.Status };
                        frame.o = JSON.stringify(resp);
                        var f = JSON.stringify(frame);
                        client.send(f);
                    }
                    else{
                        console.log("Deposit Status: " + data.Status + " for address: " + data.address[0] + " with value: " + data.Amount);
                        if(data.Amount != 0){
                            var frame = {};
                            frame.m = 0;
                            frame.i = amcid;
                            amcid += 2;
                            frame.n = "Deposit";
                            var resp = { TransactionId: data.TXID, Address: data.address[0], Amount: parseFloat(data.Amount), Status: data.Status };
                            frame.o = JSON.stringify(resp);
                            var f = JSON.stringify(frame);
                            client.send(f);
                        }
                        else{
                            console.log("Waiting for deposit for address: " + data.address[0]);
                        }
                    }
                    resolve("done");
                });
            })
        }, this);

        Promise.all(deposits).then(setTimeout(gatherDeposits, config.TimeInterval))
    });
}

function walletBalResult(){
    this.totalBalance = 0.0;
    this.error = "";
}

function walletBalance(){
    
    var totalWalletBalance = new Promise(function(resolve, fail) {
        var res = new walletBalResult();
        database.getAddresseses(function (err, result) {
           if(err){
                console.log(err);
                res.error = err;
                res.totalBalance = 0.0;
                fail(res);
            }
            else{
                if (result.length == 0) {
                    console.log("Address count is " + result.length);
                    res.error = "";
                    res.totalBalance = result;
                    resolve(res)
                }
                var addressArray = new Array();
                result.map(function(element){
                    addressArray.push(element.address);
                });
                gubiqAccountRoutes.getWalletBalances(addressArray, function (err, result) {
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
            }
        });
    });

    totalWalletBalance.then(
        function (successMessage){
        // successMessage is whatever we passed in the resolve(...) function above.
        successMessage.totalBalance = successMessage.totalBalance/config.centsPerToken;
        console.log("Result: " + JSON.stringify(successMessage));
        TotalBalance = successMessage.totalBalance;
        setTimeout(walletBalance, config.TimeInterval);
    });

    totalWalletBalance.catch(
        // Log the rejection reason
        (reason) => {
            console.log("The call to fetch the wallet balance failed" + reason.error);
            setTimeout(walletBalance, config.TimeInterval);
    });
    
}

function wsHeartBeat(){
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