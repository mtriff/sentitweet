var myConsumerSecret="j9wmVOLlSUrRlvucX19oYvhFrWBFnePBqewABrjmbcU";
//var myConsumerSecret goes up here

/**
 * Module dependencies.
 */
var express=require('express');
var http=require('http');
var path=require('path');
var util=require('util');
var OAuth=require('oauth').OAuth;
var twitter=require('ntwitter');
var io=require('socket.io').listen(8081, {log: false});
var sentiment=require('sentiment');
var TweetsProvider=require('./mongoConnector.js').TweetsProvider;
var async=require('async');

var app=express();

var mongoGrab=new TweetsProvider('127.0.0.1', 27017);

//Custom middleware to replace body parser
function rawBody(req, res, next) {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', function(chunk) {
  req.rawBody += chunk;
  });
  req.on('end', function(){
  next();
  });
}

// Environment setup
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');
//app.set('view engine', 'jade');
//app.set('view options', {layout: false});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(rawBody);
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('anotherSecret'));
app.use(express.session());
app.use(app.router);
app.use(express.session({secret:"aSecret"}));

app.use(express.static(path.join(__dirname, 'app')));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Permit statically loaded pages
app.configure(function() {
    app.use(express.static(__dirname + '/app'));
});

// Routes
app.post('/getTweets', function(req, res)
{
	console.log("getTweets Requested\n");
	//console.log("Body is: %j", req.rawBody);
	if(req.session.oauth)
	{
		var twit=new twitter({		
			consumer_key: "jfy4Y6ucET5LZLXDTyncLw",
			//Consumer secret goes here:
			consumer_secret: myConsumerSecret,
			access_token_key: req.session.oauth.access_token,
			access_token_secret: req.session.oauth.access_token_secret
		});
	}

	twit.verifyCredentials(function(err,data){
		console.log(err, data);
	});

	var body=JSON.parse(req.rawBody);

	twit.stream(
		'statuses/filter',
		{track:[body.data]},
		function(stream) {
			stream.on('data', function(data) {
				//console.log(data.text);

				//Calculate sentiment
				sentiment(data.text, function(err, result){
						data.sentiment=result.score;
						console.log("Results:");
						console.dir(result);
						console.log(data.sentiment);
						io.sockets.emit('newTweet', data)
				});


			});
		});
});

app.post('/getQuiz', function(req, res){
	console.log("Got that quiz");

  var query="{\"sentiment\": {\"$ne\": 0}}";
  query=JSON.parse(query);
  mongoGrab.findAll(JSON.stringify(query), function(error, tweets){
  	//console.log("Found something: ", tweets);
  	var baseTime=tweets[0].time;
  	var baseNow=Date.now();
  	for(var i=0; i<tweets.length; i++)
  	{
  		/*Emit each tweet to the caller on specified time
  		augmented by an offset of 20msec per tweet, to allow
  		the page to render at a reasonable rate */
  		(function(data) {
			  setTimeout(function() {
			  	io.sockets.emit('newTweet', data)
			  }, data.time+(50*i)-baseTime);
			 })(tweets[i]);
  	}
  	console.log("End of For loop");
  });
});

/********************TWITTER OAUTH****************************/
var oa=new OAuth(
		"https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "jfy4Y6ucET5LZLXDTyncLw",
    //Consumer secret goes here:
    myConsumerSecret,
    "1.0",
    "http://localhost:8080/auth/twitter/callback",
    "HMAC-SHA1"
	);

app.get('/auth/twitter', function(req, res){
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if(error)
		{
			console.log(error)
			res.send('Log In Failed.');
		}
		else
		{
			req.session.oauth={};
			req.session.oauth.token=oauth_token;
			console.log('OAuth token:'+req.session.oauth.token);
			req.session.oauth.token_secret=oauth_token_secret;
			console.log('OAuth Token Secret:'+req.session.oauth.token_secret);
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
		}
	});
});

app.get('/auth/twitter/callback', function(req, res, next){
	if(req.session.oauth) {
		req.session.oauth.verifier=req.query.oauth_verifier;
		var oauth=req.session.oauth;

		oa.getOAuthAccessToken(oauth.token,oauth.token_secret, oauth.verifier,
		function(error, oauth_access_token, oauth_access_token_secret, results)
		{
			if(error){
				console.log("Error in callback");
			 	console.log(error);
			 	res.send("Error in Twitter Callback on Log in.");
			 }
			 else
			 {
				req.session.oauth.access_token=oauth_access_token;
				req.session.oauth.access_token_secret=oauth_access_token_secret;
				console.log("HERE'S THE RESULTS:")
				console.log(results);
				var twit=new twitter({
					consumer_key: "jfy4Y6ucET5LZLXDTyncLw",
					//Consumer secret goes here
					consumer_secret: myConsumerSecret,
					access_token_key: req.session.oauth.access_token,
					access_token_secret: req.session.oauth.access_token_secret
				});

				twit.verifyCredentials(function(err, data){
					console.log(err,data);
					res.redirect('/');
				})
			}
		});
	} else
		next(new Error("Something very wrong happened here."));
});

/******************END TWITTER OAUTH*******************************/

//Start our server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
