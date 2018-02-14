var config = {};

/* Network configuration */
config.gubiqNetworkHost = "http://68.168.208.245";
config.gubiqNetworkPort = 8589;
config.websocketURL = "ws://localhost:14000/ws/";
config.env = 'Mainnet'; //prod

/* Account configuration*/
config.sweepAddress = 'OIZAEJXNCPK9FURBZYWXUAISMDJJHZUPYQBXYSGTIFQFFPYMUVJKBZ9RNRZNGRJUXWUOCTGBJKTQUEXIC';
config.password = 'BEWDRLWSEDUTJYEDGKQTVZHNUQRIWGGA99IFVHXGNJZYRHYWUJXLCRREEUGMDOTCSOYLHFEEQWHEPTNCB';
config.centsPerToken = 1000000;

/* local Database configuration */
config.mongoURL = 'mongodb://localhost:27017/IOTA';
config.addressCol  = 'address';
config.countersCol = "counters";
config.withdrawHashCol = "withdrawHashes";
config.sequenceName = "keyInex";

/* Static parameters */
config.DepositComplete = 'Complete';
config.DepositPending = 'Pending';

/* Time intervals */
config.TimeInterval = 10000;
config.walletTimeInterval = 60000;

/* Asset Manger connection config */
config.AMUserName = "IOTATest";
config.AMUserPassword = "1234";
config.AssetManagerID = 1;

module.exports = config;