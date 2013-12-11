var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

// Sets up connection to 'sentiTweet' database
TweetsProvider = function(host, port) {
  this.db= new Db('sentiTweet', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

// Gets the relevant collection from database
TweetsProvider.prototype.getCollection= function(query, callback) {
  console.log(query.collection);
  this.db.collection(query.collection, function(error, tweet_collection){
    if( error ) callback(error);
    else callback(null, tweet_collection);
  });
};

// Main grabbing function
TweetsProvider.prototype.findAll = function(query, callback) { 
    // Parse the JSON formated string into a true JSON object
    parsedQuery=JSON.parse(query);

    this.getCollection(parsedQuery, function(error, tweet_collection) { 
      if( error ) callback(error)
      else {
        // Pass JSON object to mongo database with find() call
        tweet_collection.find({}).sort({"time":-1}).limit(100).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    }); //end getCollection
}; //end findAll

TweetsProvider.prototype.getAverage=function(query, callback){
    // Parse the JSON formated string into a true JSON object
    parsedQuery=JSON.parse(query);

    this.getCollection(parsedQuery, function(error, tweet_collection) { 
      if( error ) callback(error)
      else {
        // Pass JSON object to mongo database with find() call
        tweet_collection.aggregate({"$group": {_id:1, average:{$avg: "$sentiment"}}}, function(err, result){
          callback(null, result);

        });
      }
    }); //end getCollection
}

// Allows TweetsProvider function to be called outside this file (in app.js)
exports.TweetsProvider = TweetsProvider;