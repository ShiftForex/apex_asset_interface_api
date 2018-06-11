var W3CWebSocket = require('websocket').w3cwebsocket

class websocketService {
    constructor(options){
        this.options = options || {}
        this.logger = this.options.logger
        this.amcid = 1;

        // code here to create a websocket client
        this.logger.log('initializing websocket client')

        const assetName = this.options.asset.name
        const AssetService = require(`./${assetName}Service.js`)
        const assetService = new AssetService({ ...this.options.asset, logger: this.options.logger })

        // instantiate new websocket connection
        this.websocketClient = new W3CWebSocket(this.options.websocketURL)

        // define websocket  methods
        this.websocketClient.onerror = () => {
            this.logger.log('WebSocket Connection Error')
        }
        
        this.websocketClient.onopen = async () => {
            this.logger.log('WebSocket Client Connected')
            this.logger.log('Authenticating with Asset Manager')
            this.authenticate({ UserName: this.options.asset.AMUserName, Password: this.options.asset.AMUserPassword, AssetManagerId : this.options.asset.AssetManagerID })
            this.logger.log('Authentication Successful')

            // if (heartBeatTimerOn === false) {
            //     wsHeartBeat()
            //     heartBeatTimerOn = true
            // }
            // gatherDeposits(callsToGatherDeposits)
            // walletBalance()
        }

        this.websocketClient.onmessage = (message) => {

            this.logger.log('WebSocket Message Received')

            let frame = JSON.parse(message.data)
            this.logger.log(frame)


            // var synchroCallBack = amsynchro[frame.i]


            // // rewrite this once understood
            // if (synchroCallBack === undefined) {
            // }
            // else {
            //     if (frame.o == '') {
            //         synchroCallBack({})
            //     }
            //     else {
            //         synchroCallBack(JSON.parse(frame.o))
            //     }
            //     delete amsynchro[frame.i]
            // }

            // switch(frame.n) {
            //     case "GetWithdrawFormTemplateTypes":
            //         GetWithdrawFormTemplateTypes(frame.o, frame.i)
            //         break;
            //     case "Deposit":
            //         this.logger.log("Deposit completed Successfully")
            //         break;
            //     case "GetWithdrawFormTemplate":
            //         this.logger.log("Deposit completed Successfully")
            //         break;
            //     case "SubmitWithdrawForm":
            //         SubmitWithdrawForm(frame.o, frame.i)
            //         break;









            //     default:
            //         code block
            // }



       
        
            // else if (frame.n == "SubmitWithdrawForm") {
            //     SubmitWithdrawForm(frame.o, frame.i)
            // }
            // else if (frame.n == "CreateNewDepositKey") {
            //     CreateNewDepositKey(frame.o, frame.i)
            // }
            // else if (frame.n == "GetDepositRequestInfoTemplate") {
            //     GetDepositRequestInfoTemplate(frame.o, frame.i)
            // }
            // else if (frame.n == "CallbackNotify") {
            //     CallbackNotify(frame.o, frame.i)
            // }
            // else if (frame.n == "GetBalanceOf") {
            //     GetBalance(frame.o, frame.i)
            // }
            // else if (frame.n == "GetTotalBalance") {
            //     GetTotalBalance(frame.o, frame.i)
            // }
            // else if (frame.n == "GetProviderDetails") {
            //     GetProviderDetails(frame.o, frame.i)
            // }
            // else if (frame.n == "GetProviderAdminFunctionList") {
            //     GetProviderAdminFunctionList(frame.o, frame.i)
            // }
            // else if (frame.n == "ExecuteProviderAdminFunction") {
            //     ExecuteProviderAdminFunction(frame.o, frame.i)
            // }
        
            





            // // ***********************************
            // this.logger.log('WebSocket Message Received')
            // log.info("onmessage received: " + e)
        
            // if (typeof e.data === 'string') {
            //     log.info("Received string: '" + e.data + "'")
            // }
        
            // var frame = JSON.parse(e.data)
            // var synchroCallBack = amsynchro[frame.i]
            
            // if (synchroCallBack === undefined) {
            // }
            // else {
            //     if (frame.o == '') {
            //         synchroCallBack({})
            //     }
            //     else {
            //         synchroCallBack(JSON.parse(frame.o))
            //     }
            //     delete amsynchro[frame.i]
            // }



            // if (frame.n == "GetWithdrawFormTemplateTypes") {
            //     GetWithdrawFormTemplateTypes(frame.o, frame.i)
            // }
            // if (frame.n == "Deposit") {
            //     log.info("Deposit completed Successfully")
            // }
            // else if (frame.n == "GetWithdrawFormTemplate") {
            //     GetWithdrawFormTemplate(frame.o, frame.i)
            // }
            // else if (frame.n == "SubmitWithdrawForm") {
            //     SubmitWithdrawForm(frame.o, frame.i)
            // }
            // else if (frame.n == "CreateNewDepositKey") {
            //     CreateNewDepositKey(frame.o, frame.i)
            // }
            // else if (frame.n == "GetDepositRequestInfoTemplate") {
            //     GetDepositRequestInfoTemplate(frame.o, frame.i)
            // }
            // else if (frame.n == "CallbackNotify") {
            //     CallbackNotify(frame.o, frame.i)
            // }
            // else if (frame.n == "GetBalanceOf") {
            //     GetBalance(frame.o, frame.i)
            // }
            // else if (frame.n == "GetTotalBalance") {
            //     GetTotalBalance(frame.o, frame.i)
            // }
            // else if (frame.n == "GetProviderDetails") {
            //     GetProviderDetails(frame.o, frame.i)
            // }
            // else if (frame.n == "GetProviderAdminFunctionList") {
            //     GetProviderAdminFunctionList(frame.o, frame.i)
            // }
            // else if (frame.n == "ExecuteProviderAdminFunction") {
            //     ExecuteProviderAdminFunction(frame.o, frame.i)
            // }
        }
        
        this.websocketClient.onclose = () => {
            this.logger.log('WebSocket Client Disconnected')
        }

    }
    
 
    async authenticate(req) {
        let frame = {}
        frame.m = 0
        frame.i = this.amcid
        frame.n = "Authenticate"
        frame.o = JSON.stringify(req)
        const frameJSON = JSON.stringify(frame)
        this.websocketClient.send(frameJSON)
        this.amcid += 2
    } 

    //this synchronizes the requests with the responses so that your requesting function receives the correct resultset
    // //use this whenever there's a possibility of more than one request for the same call from different functions
    // async amSynchroCall(remoteFunction, payload, callback) {
    //     var frame = new APService.ANWSFrame()
    //     frame.m = 0
    //     frame.i = this.amcid
    //     amsynchro[this.amcid] = callback
    //     frame.n = remoteFunction
    //     frame.o = JSON.stringify(payload)
    //     var f = JSON.stringify(frame)
    //     client.send(f)
    //     am_parent.amcid += 2
    // }



    // async CreateNewDepositKey(o, i) {
    //     var ob = JSON.parse(o)
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     var resp
    //     var f

    //     gubiqAccountRoutes.getNewAddress(function (err, result) {
    //         if (err) {
    //             resp = {}
    //             frame.o = JSON.stringify(resp)
    //             f = JSON.stringify(frame)
    //             client.send(f)
    //             return
    //         }
    //         else {
    //             log.info("getNewAddress details")
    //             log.info("Address: " + result)
    //             resp = { DepositKey: result }
    //             frame.o = JSON.stringify(resp)
    //             f = JSON.stringify(frame)
    //             client.send(f)
    //             return
    //         }
    //     })
    // }

    // async GetWithdrawFormTemplateTypes(o, i) {
    //     var ob = JSON.parse(o)
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetWithdrawFormTemplateTypes"

    //     var resp = { TemplateTypes: [] }
    //     resp.TemplateTypes.push("ToExternalUBIQAddress")

    //     frame.o = JSON.stringify(resp)
    //     var f = JSON.stringify(frame)
    //     client.send(f)
    // }

    // async GetWithdrawFormTemplate(o, i) {
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetWithdrawFormTemplate"

    //     var resp = { ExternalAddress: "", Comment: "", TemplateType: "ToExternalUBIQAddress" }

    //     frame.o = JSON.stringify(resp)
    //     var f = JSON.stringify(frame)

    //     client.send(f)
    // }

    // async SubmitWithdrawForm(o, i) {

    //     var ob = JSON.parse(o)
    //     var form = JSON.parse(ob.Form)
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "SubmitWithdrawForm"
    //     var resp = new Object()
    //     resp.ReplyObject = "" 
    //     resp.IsSucessful = true 
    //     resp.ErrorStr = ""
        
    //     if(ob.Type !== "ToExternalUBIQAddress")
    //     {
    //         resp.IsSucessful = false
    //         resp.ErrorStr = "Invalid Template type"
    //         frame.o = JSON.stringify(resp)
    //         client.send(JSON.stringify(frame))
    //     }
    //     else if(form.ExternalAddress === undefined || form.ExternalAddress == "" || form == "{}")
    //     {
    //         resp.IsSucessful = false
    //         resp.ErrorStr = "ExternalAddress cannot be null or empty"
    //         frame.o = JSON.stringify(resp)
    //         client.send(JSON.stringify(frame))
    //     }
    //     else if(ob.Amount === undefined || ob.Amount == null || ob.Amount == ""){
    //         resp.IsSucessful = false
    //         resp.ErrorStr = "Amount cannot be null or empty"
    //         frame.o = JSON.stringify(resp)
    //         client.send(JSON.stringify(frame))
    //     }

    //     var toAddress = form.ExternalAddress
    //     var value = parseFloat(ob.Amount)
    //     var comment = form.Comment

    //     gubiqRoutes.getSweepAccountBalance(function (err, result) {
    //         if (err) {
    //             frame.o = JSON.stringify(hotBalance)
    //         }
    //         else 
    //         {
    //             sweepAccountBalance = result
    //             if(sweepAccountBalance < value)
    //             {
    //                 resp.IsSucessful = false
    //                 resp.ErrorStr = "Sweep Account balance is insufficient!!"
    //                 frame.o = JSON.stringify(resp)
    //                 client.send(JSON.stringify(frame))
    //             }
        
    //             gubiqAccountRoutes.sendTransaction(config.SweepAccount, toAddress, value, comment, function (err, result) {
    //                 if (err) {
    //                     resp.IsSucessful = false
    //                     resp.ErrorStr = JSON.stringify(result)
    //                 }
    //                 else {
    //                     resp.IsSucessful = true
    //                     resp.ReplyObject = JSON.stringify(result)
    //                     resp.ErrorStr = "" 
    //                 }
    //                 frame.o = JSON.stringify(resp)
    //                 client.send(JSON.stringify(frame))
    //             })
    //         }
    //     })
    // }

    // async GetDepositRequestInfoTemplate(o, i) {
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetDepositRequestInfoTemplate"
    //     frame.o = ""
    //     var f11 = JSON.stringify(frame)
    //     client.send(f11)
    // }

    // async CallbackNotify(o, i) {
    //     var f = {}
    //     f.IsSuccessful = true
    //     f.ErrorStr = ""
    //     f.ReplyObject = "{}"

    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "CallbackNotify"
    //     frame.o = JSON.stringify(f)
    //     var ret = JSON.stringify(frame)

    //     client.send(ret)
    // }

    // async GetTotalBalance (o, i) {
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetTotalBalance"
    //     var hotBalance = 0.0
    //     try{
    //         gubiqRoutes.getSweepAccountBalance(function (err, result) {
    //             if (err) {
    //                 frame.o = JSON.stringify(hotBalance)
    //             }
    //             else {
    //                 hotBalance = result
    //                 log.info("SweepAccount Balance: " + hotBalance)
    //                 sweepAccountBalance = hotBalance
    //                 frame.o =  JSON.stringify(hotBalance)
    //             }
    //             var ret = JSON.stringify(frame)
    //             log.info(ret)
    //             client.send(ret)
    //         })
    //     }
    //     catch(e){
    //         log.error("Error in getTotalBalance" + JSON.stringify(e))
    //     }

    // }

    // async GetBalance (o, i) {
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetBalance"

    //     gubiqRoutes.getBalance(o , function (err, result) {
    //         if (err) {
    //             frame.o = 0
    //         }
    //         else {
    //             var amt = JSON.parse(result)
    //             frame.o = amt
    //         }
    //         var ret = JSON.stringify(frame)
    //         client.send(ret)
    //     })
    // }

    // async GetProviderDetails (o, i) {
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetProviderDetails"
    //     var res = new Object()

    //     gubiqRoutes.getAccounts(function (err, result) {
    //         res.NumAccounts = result.length
    //         gubiqRoutes.getSweepAccountBalance(function (err, result) {
                
    //             res.SweepAccountBal = result
    //             res.GasLimit = config.gas
    //             res.TotalWalletBal = TotalBalance
    //             //res.ColdWalletBal = totalColdWalletBalance
                
    //             frame.o = JSON.stringify(res)
    //             var ret = JSON.stringify(frame)
    //             client.send(ret)
    //         })
    //     })
    // }

    // async ExecuteProviderAdminFunction (o, i) {
    //     var ob = JSON.parse(o)
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "ExecuteProviderAdminFunction"
    //     frame.o = "Invalid Function"
    //     var f = JSON.stringify(frame)
    //     client.send(f)
    // }

    // async GetProviderAdminFunctionList (o, i) {
    //     var frame = {}
    //     frame.m = 1
    //     frame.i = i
    //     frame.n = "GetProviderAdminFunctionList"

    //     var functioncollection = []
        
    //     frame.o = JSON.stringify(functioncollection)
    //     var ret = JSON.stringify(frame)
    //     client.send(ret)
    // }

    // async gatherDeposits(arg) {
    //     callsToGatherDeposits++
    //     log.info("GatherDeposits Counter: " + callsToGatherDeposits)
    //     var start = new Date().getTime()
    //     gubiqRoutes.getAccounts(function (err, result) {
    //         try{
    //             if(err){
    //                 log.info("Error:", err.message)
    //             }
    //             if (result.length == 0) {
    //                 log.info("waiting for deposits - New Address count is " + result.length)
    //             }
    //             var deposits = result.map(function(address) 
    //             {
    //                 return new Promise(function(resolve, fail) 
    //                 {
    //                     gubiqAccountRoutes.getDepositConfirmation(address, function (err2, data) {
    //                         if(err2){
    //                             log.info("Error:", err2.message)
    //                             fail("failed")
    //                         }
    //                         try {
    //                             log.info(JSON.stringify(data))
    //                             if (data.Status == "Complete" && (data.Address == address)) {
    //                                 var frame = {}
    //                                 frame.m = 0
    //                                 frame.i = amcid
    //                                 amcid += 2
    //                                 frame.n = "Deposit"
    //                                 var resp = { TransactionId: data.TXID, Address: data.Address, Amount: parseFloat(data.Amount), Status: data.Status }
    //                                 frame.o = JSON.stringify(resp)
    //                                 var f = JSON.stringify(frame)
    //                                 client.send(f)
    //                             }
    //                             else{
    //                                 log.info("Deposit Status: " + data.Status + " for address: " + data.Address + " with value: " + data.Amount)
    //                                 if(data.Amount != 0){
    //                                     var frame = {}
    //                                     frame.m = 0
    //                                     frame.i = amcid
    //                                     amcid += 2
    //                                     frame.n = "Deposit"
    //                                     var resp = { TransactionId: data.TXID, Address: data.Address, Amount: parseFloat(data.Amount), Status: data.Status }
    //                                     frame.o = JSON.stringify(resp)
    //                                     var f = JSON.stringify(frame)
    //                                     client.send(f)
    //                                 }
    //                                 else{
    //                                     log.info("Waiting for deposit for address: " + data.Address)
    //                                     resolve("done")
    //                                 }
    //                             }
    //                             resolve("done")
    //                         } catch (e) {
    //                             log.info("Error in getting deposits for address: " + JSON.stringify(e))
    //                             fail("failed")
    //                         }finally{
    //                             resolve("done")
    //                         }
    //                     })
    //                 })
    //             }, this)

    //             Promise.all(deposits).then(function(){
    //                 setTimeout(gatherDeposits, config.TimeInterval)
    //             }).catch(function(err) {
    //             // catch any error that happened so far
    //             log.info("Failed: ", err)
    //             })
    //         }
    //         catch (e) {
    //             log.info("Error in gatherDeposits: " + JSON.stringify(e))
    //         }
    //     })
    // }

    // async walletBalResult(){
    //     this.totalBalance = 0.0
    //     this.error = ""
    // }

    // async walletBalance (){
        
    //     var totalWalletBalance = new Promise(function(resolve, fail) {
    //         var res = new walletBalResult()
    //         gubiqRoutes.getWalletBalance(function (err, result) {
    //             if (err) {
    //                 res.error = err
    //                 res.totalBalance = 0.0
    //                 fail(res)
    //             }
    //             else {
    //                 res.error = ""
    //                 res.totalBalance = result
    //                 resolve(res)
    //             }
    //         })
    //     })

    //     totalWalletBalance.then(
    //         function (successMessage){
    //         // successMessage is whatever we passed in the resolve(...) function above.
    //         successMessage.totalBalance = successMessage.totalBalance
    //         log.info("Result: " + JSON.stringify(successMessage))
    //         TotalBalance = successMessage.totalBalance
    //         setTimeout(walletBalance, config.walletTimeInterval)
    //     })

    //     totalWalletBalance.catch(
    //         // Log the rejection reason
    //         (reason) => {
    //             log.info("The call to fetch the wallet balance failed" + reason.error)
    //             setTimeout(walletBalance, config.walletTimeInterval)
    //     })
        
    // }

    // async wsHeartBeat(){
    //     var hearBeat = new Promise(function(resolve, fail) {
    //         try{
    //             if(client._connection != undefined && client._connection.connected){
    //                 var frame = {}
    //                 frame.m = 0
    //                 frame.i = amcid
    //                 amcid += 2
    //                 frame.n = "Ping"
    //                 frame.o = ""
    //                 var f = JSON.stringify(frame)
    //                 client.send(f)
    //             }
    //             else{
    //                 if(client._connection != undefined)
    //                     client._connection.drop(1001)
    //                 initialize()
    //             }
    //             setTimeout(wsHeartBeat, config.TimeInterval)
    //         }
    //         catch(e){
    //             log.error(e)
    //             fail("failed")
    //         }
    //     })
        
    //     hearBeat.catch(
    //         function(reason){
    //             log.info("The WebSocket connection to Asset Manager is not connected")
    //             setTimeout(wsHeartBeat, config.TimeInterval)
    //         }
    //     )
        
    //     process.on('unhandledRejection', error => {
    //         client = null
    //         log.error('unhandledRejection', error)
    //     })
    // }

  }
  
  module.exports = websocketService
