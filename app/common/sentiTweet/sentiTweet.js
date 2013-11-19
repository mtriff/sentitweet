var app=angular.module('sentiTweets', []);

app.controller('BrowseCtrl', function($scope, theServer)
{
	//$scope.auth=theServer.authorize();
	
  console.log('Called BrowseCtrl');
	$scope.tweets=[
		{user: {screen_name: 'TestUser'}, text: 'Text of Tweet Here'}
	];

	var socket=io.connect('http://localhost:8081');
	window.socket=socket;
	socket.on('newTweet', function(theTweet)
	{
		$scope.tweets.unshift(theTweet);
		$scope.$apply();
	});

	theServer.getTweets();
});

// function BrowseCtrl($scope)
// {
// 	console.log('Called BrowseCtrl');
// 	$scope.tweets=[{user: {screen_name: 'TestUser'}, text: 'Text of Tweet Here'}];

// 	var socket=io.connect('http://localhost:8081');
// 	window.socket=socket;
// 	socket.on('newTweet', function(theTweet)
// 	{
// 		$scope.tweets.push(theTweet);
// 		$scope.$apply();
// 	});
// }

 app.factory('theServer', function($http, $q) {
	return {
		authorize: function()
		{
			var deferred=$q.defer();
			$http.get('/auth/twitter').success(function(data) {
				console.log(data);
				deferred.resolve(data);
			}).error(function()
			{
				deferred.reject();
			});
			return deferred.promise;		},
		getTweets: function()
		{
			var deferred=$q.defer();
			$http.get('/getTweets').success(function(data) {
				console.log(data);
				deferred.resolve(data);
			}).error(function()
			{
				deferred.reject();
			});
			return deferred.promise;
		}
	}
});