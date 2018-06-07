var config = {
    
    port: 6000,

    provider:{
        name: 'iota',
    },

    /* Network configuration */
    gubiqNetworkHost: "http://68.168.208.245",
    gubiqNetworkPort: 8589,
    websocketURL: "ws://localhost:14000/ws/",
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

    /* Asset Manger connection config */
    AMUserName: "UBIQTest",
    AMUserPassword: "1234",
    AssetManagerID: 1,

    logOptions: {
        logDirectory: __dirname + '/logs',
        fileNamePattern: 'gubiq_app-<date>.log',
        dateFormat:'YYYY.MM.DD'
    }

}

module.exports = config