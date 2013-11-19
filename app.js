/**
 * Module dependencies.
 */

var express=require('express');
var http=require('http');
var path=require('path');

var app=express();

// Environment setup
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');
//app.set('view engine', 'jade');
//app.set('view options', {layout: false});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'app')));

app.configure(function() {
    app.use(express.static(__dirname + '/app'));
});

// Routes
app.get('/getTweets', function(req, res)
{
	console.log("Nothing to see here..\n");
	res.send('You made it!');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
