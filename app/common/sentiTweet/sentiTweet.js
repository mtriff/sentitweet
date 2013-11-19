var app=angular.module('sentiTweets', []);

app.controller('BrowseCtrl', function($scope, theServer)
{
	$scope.tweets=theServer.getTweets();
});

app.factory('theServer', function($http, $q) {
	return {
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