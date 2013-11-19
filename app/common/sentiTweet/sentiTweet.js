var app=angular.module('sentiTweets', []);

app.controller('BrowseCtrl', function($scope, theServer)
{
	//$scope.auth=theServer.authorize();
	$scope.trackTweets=function()
	{
		console.log('Called BrowseCtrl');
		$scope.tweets=[];

		if(typeof socket === 'undefined')
		{
			var socket=io.connect('http://localhost:8081');
			window.socket=socket;
		}

		if(socket.listeners('newTweet').length==0)
		{
			console.log('Adding a listener');
			socket.on('newTweet', function(theTweet)
			{
				$scope.tweets.unshift(theTweet);
				$scope.$apply();
			});
		}

		console.log("getTweets with: "+$scope.hashTag);
		theServer.getTweets($scope.hashTag);
	};

	$scope.stopTracking=function()
	{
		socket.removeAllListeners('newTweet');
	}
});

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
		getTweets: function(toTrack)
		{
			var deferred=$q.defer();
			$http.post('/getTweets', {data: toTrack}).success(function(data) {
				console.log(data);
				deferred.resolve(data);
			}).error(function()
			{
				alert('You must log in first.');
				deferred.reject();
			});
			return deferred.promise;
		}
	}
});