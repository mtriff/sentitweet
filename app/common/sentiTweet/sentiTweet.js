var app=angular.module('sentiTweets', []);

app.controller('BrowseCtrl', function($scope, theServer)
{

	/*Controls which menu is showing*/
	var isStreaming=true;

	$scope.stream=function()
	{
		return isStreaming;
	}

	$scope.showQuiz=function()
	{
		isStreaming=false;
	}

	$scope.showStream=function()
	{
		isStreaming=true;
	}

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

		if(isStreaming)
		{
			console.log("getTweets with: "+$scope.hashTag);
			theServer.getTweets($scope.hashTag);
		}
		else
		{
			console.log("getQuiz");
			theServer.getQuiz(1);
		}
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
		},
		getQuiz: function(number)
		{
			var deferred=$q.defer();
			$http.post('/getQuiz', {data: 1}).success(function(data) {
				console.log(data);
				deferred.resolve(data)
			}).error(function()
			{
				deferred.reject();
			});
			return deferred.promise;
		}
	}
});