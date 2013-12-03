var app=angular.module('sentiTweets', []);

app.controller('BrowseCtrl', function($scope, theServer)
{
	/**DEMOVAR**/
	var aug=0;
	answersArr=[];
	$(".btn-group > button.btn").on("click", function(){
  	answersArr[aug] = +this.innerHTML;
	});

	$scope.getResults=function(index)
		{
			return answersArr[index];
		}
	/**DEMOVAR**/


	/*Controls which menu is showing*/
	var isStreaming=true; //Prompt for the user to browse tweets
	var isQuiz=false; //Prompt to start the testing
	var isTweets=true; //Div showing all of the tweets
	var isAnswers=false; //Div prompting user to enter their answers
	var isResults=false; //Div containing results comparison

	$scope.stream=function()
	{
		return isStreaming;
	}

	$scope.quiz=function()
	{
		return isQuiz;
	}

	$scope.tweetsDiv=function()
	{
		return isTweets;
	}

	$scope.answers=function()
	{
		return isAnswers;
	}

	$scope.results=function()
	{
		return isResults;
	}

	$scope.showQuiz=function()
	{
		isStreaming=false;
		isQuiz=true;
		isTweets=true;
		isAnswers=false;
	}

	$scope.showStream=function()
	{
		isStreaming=true;
		isQuiz=false;
		isTweets=true;
		isAnswers=false;
	}

	$scope.showAnswers=function()
	{
		isStreaming=false;
		isTweets=false;
		isQuiz=false;
		isAnswers=true;
	}

	$scope.showTweetsDiv=function()
	{
		isStreaming=false;
		isTweets=true;
		isQuiz=false;
		isAnswers=false;
	}

	/*Visual Augmentation*/
	var visual=false;

	$scope.visAug=function(sentiment)
	{
		if(visual)
		{
			return sentiment;
		}
		else
		{
			return 0;
		}
	}

	/*Audio Augmentation*/
	var audio=false;

	url=new Array();
	url[10]=['assets/sounds/c021.mp3','assets/sounds/c021.ogg'];
	url[9]=['assets/sounds/c020.mp3','assets/sounds/c020.ogg'];
	url[8]=['assets/sounds/c018.mp3','assets/sounds/c018.ogg'];
	url[7]=['assets/sounds/c017.mp3','assets/sounds/c017.ogg'];
	url[6]=['assets/sounds/c016.mp3','assets/sounds/c016.ogg'];
	url[5]=['assets/sounds/c015.mp3','assets/sounds/c015.ogg'];
	url[4]=['assets/sounds/c014.mp3','assets/sounds/c014.ogg'];
	url[3]=['assets/sounds/c013.mp3','assets/sounds/c013.ogg'];
	url[2]=['assets/sounds/c012.mp3','assets/sounds/c012.ogg'];
	url[1]=['assets/sounds/c011.mp3','assets/sounds/c011.ogg'];
	url[-1]=['assets/sounds/c010.mp3','assets/sounds/c010.ogg'];
	url[-2]=['assets/sounds/c009.mp3','assets/sounds/c009.ogg'];
	url[-3]=['assets/sounds/c008.mp3','assets/sounds/c008.ogg'];
	url[-4]=['assets/sounds/c007.mp3','assets/sounds/c007.ogg'];
	url[-5]=['assets/sounds/c006.mp3','assets/sounds/c006.ogg'];
	url[-6]=['assets/sounds/c005.mp3','assets/sounds/c005.ogg'];
	url[-7]=['assets/sounds/c004.mp3','assets/sounds/c004.ogg'];
	url[-8]=['assets/sounds/c003.mp3','assets/sounds/c003.ogg'];
	url[-9]=['assets/sounds/c002.mp3','assets/sounds/c002.ogg'];
	url[-10]=['assets/sounds/c001.mp3','assets/sounds/c001.ogg'];
	
	/* Controls Receiving Tweets */
	$scope.trackTweets=function()
	{
		/**DEMOVAR**/
		//var activebtnvalue = $("#answerGroup").find("button.active").prop('value');
		console.log(answersArr);
		if(aug==1)
		{
			visual=true;
		}
		else if(aug==2)
		{
			visual=false;
			audio=true;
		}
		aug++;


		if(aug<4)
		{
		/**DEMOVAR**/

		$("html, body").scrollTop($("#tweetStream").offset().top);
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
				isQuiz=false;
				$scope.showTweetsDiv();
				//console.log(theTweet);
				
				if(audio)
				{
					var sound=new Howl({urls: url[theTweet.sentiment]}).play();
				}

				$scope.tweets.unshift(theTweet);
				$scope.$apply();
			});

			socket.on('doneQuiz', function(data)
			{
				$scope.showAnswers();
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

		/**DEMOVAR**/
		}
		else
		{
			isResults=true;
		}
		/**DEMOVAR**/

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