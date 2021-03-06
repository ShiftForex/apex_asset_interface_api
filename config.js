var config = {
    express:{
        port: 6000,
    },
    
    asset:{
        name: 'gubiq',
         /* Asset Manger connection config */
        AMUserName: "su",
        AMUserPassword: "1234",
        AssetManagerID: 1,
    },

    /* Network configuration */
    gubiqNetworkHost: "http://68.168.208.245",
    gubiqNetworkPort: 8589,
    websocketURL: "ws://167.114.188.251:14000/ws/",
    env: 'Mainnet', //prod

    /* Account configuration*/
    SweepAccount: '0x187305c49dbf8fcb9ae4b8906cf404b4ad1e77da',
    SweepAccountPassphrase: 'Test1234',
    password: "",
    gas: "100000",
    centsPerEther: 1000000000000000000,
    DepositConfirmations: 1,

    /* Static parameters */
    DepositComplete: 'Complete',
    DepositPending: 'Pending',

    /* Time intervals */
    TimeInterval: 10000,
    walletTimeInterval: 60000,

   

    logOptions: {
        logDirectory: __dirname + '/logs',
        fileNamePattern: 'gubiq_app-<date>.log',
        dateFormat:'YYYY.MM.DD'
    }

}

module.exports = config