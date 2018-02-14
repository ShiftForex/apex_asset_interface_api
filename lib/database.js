var express = require('express');
var mongodb = require('mongodb');
var config = require('../config.js');
var autoIncrement = require("mongodb-autoincrement");

var app = express();

var MongoClient = mongodb.MongoClient;
var db;

// Initialize connection once
MongoClient.connect(config.mongoURL, function(err, database) {
    if(err) throw err;
    console.log("Database connected!");
    console.log(database);
    db = database;
    
    db.createCollection(config.addressCol, function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
    });
    db.createCollection(config.withdrawHashCol, function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
    });
    db.createCollection(config.countersCol, function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
    });
    
});


exports.createNewIndex = function (callback){
    
    autoIncrement.getNextSequence(db, config.countersCol, function (err, autoIndex) {
        if(err) callback(err, err.message);
        callback(err, autoIndex);
    });
}

exports.getlatestIndex = function (seqName, callback) {
    var collection = db.collection(config.countersCol);
    collection.findOne({_id: seqName}, function (err, result) {
        if (err) {
            callback(true, err.message); 
            return;
        }
        console.log("Latest keyindex!" + result.seq);
        console.log(JSON.stringify(result));
        callback(false, result.seq); 
        return;
    });
}

exports.saveWithdrawalHashes = function (transactionTailHash, address, callback){
    
    var collection = db.collection(config.withdrawHashCol);
    collection.insert({'transactionTailHash': transactionTailHash, "address": address, }, function (err, result) {
        if (err) {
            callback(true, result); 
            return;
        }
        console.log("transactionTailHash saved successfully!");
        console.log(JSON.stringify(result));
        callback(false, result); 
        return;
    });
}

exports.saveAddress = function (address, keyIndex, type, callback){
    var collection = db.collection(config.addressCol);
    var status = 'Pending';
    if (type !== config.depositAddress)
        status = '';
    collection.insert({ 'address': address, "keyIndex": keyIndex, "type": type, "status": status }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Address saved to the db: " + address);
            callback(false, result);
            return;
        }
        //db.close();
    });
}

exports.updateDepositAddressStatus = function(address, status, callback) {
    var collection = db.collection(config.addressCol);
    //db.address.update({'address': address},{ $set: { 'status': Pending/Complete}})
    collection.update({ 'address': address }, { $set: { 'status': status} }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Updated the address: " + address + " in the db with status: " + status);
            callback(false, result);
            return;
        }
        //db.close();
    });
}

exports.getAddresseses = function (callback) {
    var collection = db.collection(config.addressCol);
    collection.find({}).toArray(callback);
}

exports.getAllAddresses = function (callback) {
    var collection = db.collection(config.addressCol);
    //db.address.find({ $and: [{'type': "Deposit Address"}, {"status": 'Complete'}]});
    collection.find({ $and: [{ 'type': "Deposit Address" }, { "status": 'Pending' }] }).toArray(callback);
}