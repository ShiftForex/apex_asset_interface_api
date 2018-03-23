var config = {};

/* Network configuration */
config.gubiqNetworkHost = "http://68.168.208.245";
config.gubiqNetworkPort = 8589;
config.websocketURL = "ws://localhost:14000/ws/";
config.env = 'Mainnet'; //prod

/* Account configuration*/
config.SweepAccount = '0x187305c49dbf8fcb9ae4b8906cf404b4ad1e77da';
config.SweepAccountPassphrase = 'Test1234';
config.password = "";
config.gas = "100000";
config.centsPerEther = 1000000000000000000;
config.DepositConfirmations = 1;

/* Static parameters */
config.DepositComplete = 'Complete';
config.DepositPending = 'Pending';

/* Time intervals */
config.TimeInterval = 10000;
config.walletTimeInterval = 60000;

/* Asset Manger connection config */
config.AMUserName = "UBIQTest";
config.AMUserPassword = "1234";
config.AssetManagerID = 1;

config.logOptions = {
    logDirectory: __dirname + '/logs',
    fileNamePattern: 'gubiq_app-<date>.log',
    dateFormat:'YYYY.MM.DD'
};

module.exports = config;