var app=angular.module('sentiTweets', []);

app.controller('BrowseCtrl', function($scope, theServer)
{
	var aug=0;
	var quizNum=1;
	$scope.average=-1;
	var MAXQUIZNUM=6;

	answersArr=[];
	$(".btn-group > button.btn").on("click", function(){
  	answersArr[aug] = +this.innerHTML;
	});

	$scope.getResults=function(index)
		{
			return answersArr[index];
		}

	var averages=new Array();
	averages[1]=1.92;
	averages[2]=0.595;
	averages[3]=-1.33;
	averages[4]=-0.725;
	averages[5]=1.92;
	averages[6]=0.86;

	$scope.printAverage=function()
	{
		return (averages[quizNum-1]+5).toFixed(2);
	}

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
	
	$scope.playSound=function(index)
	{
		if(index>-11 && index<11)
		{
			var played=new Howl({urls: url[index]}).play()
		}
	}

	/* Controls Receiving Tweets */
	$scope.trackTweets=function()
	{
		/**DEMOVAR**/
		//var activebtnvalue = $("#answerGroup").find("button.active").prop('value');
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

		$("html, body").scrollTop($("#tweetStream").offset().top);
		$scope.tweets=[];

		if(typeof socket === 'undefined')
		{
			var socket=io.connect('http://localhost:8081');
			window.socket=socket;
		}
		
		/*
		if(socket.listeners('gotAverage').length==0)
		{
			console.log('Adding gotAverage Listener');

			socket.on('gotAverage', function(ave)
			{
				console.log("gotAverage");
				console.log(ave);
				$scope.average=ave.average;
				$scope.$apply();
			});
		}
		*/

		if(socket.listeners('newTweet').length==0)
		{
			console.log('Adding a listener');

			socket.on('newTweet', function(theTweet)
			{
				//console.log("Got tweet, quiz:"+quizNum+" aug:"+aug);
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
		}

		if(socket.listeners('doneQuiz').length==0)
		{
			socket.on('doneQuiz', function(data)
			{
				console.log("DONEQUIZ");
				$scope.showAnswers();
				$scope.$apply();
			});
		}

		console.log(answersArr);
		/*if(aug==1)
		{
			console.log("Sending for avg");
			//theServer.getAverage(quizNum);
		}*/

		if(aug<4 && quizNum<=MAXQUIZNUM)
		{
			isResults=false;
			console.log("isStreaming? - "+isStreaming);
			if(isStreaming)
			{
				console.log("getTweets with: "+$scope.hashTag);
				theServer.getTweets($scope.hashTag);
			}
			else
			{
				console.log("getQuiz:"+quizNum);
				theServer.getQuiz(quizNum);
			}
		}
		else if(aug>3 && quizNum<=MAXQUIZNUM)
		{
			resultsToSend={};
			resultsToSend.ans=answersArr.slice(1,4);
			resultsToSend.quiz=quizNum;
			theServer.writeResults(resultsToSend);
			/*Reset the augmentation for the next quiz set*/
			aug=0;
			audio=false;
			//quizNum++;
			quizNum++;
			isAnswers=false;			
			isResults=true;
		}
		else
		{
			/*Must be done the last augmentation of the last quiz now*/
			alert('All done! Thank you!');
		}
		console.log("Aug is: "+aug);
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
			console.log("Server getting quiz "+number);
			$http.post('/getQuiz', {data: number}, {timeout: deferred.resolve}).success(function(data) {
				console.log(data);
				deferred.resolve(data)
			}).error(function()
			{
				console.log("REJECTED");
				deferred.reject();
			});
			deferred.resolve();
			return deferred.promise;
		},
		writeResults: function(resultsData)
		{
			var deferred=$q.defer();
			console.log("Writing results to file..");
			$http.post('/writeResults', {data: resultsData}, {timeout: deferred.resolve}).success(function(data) {
				console.log(data);
				deferred.resolve(data)
			}).error(function()
			{
				console.log("REJECTED");
				deferred.reject();
			});
			deferred.resolve();
			return deferred.promise;
		}/*,
		getAverage: function(number)
		{
			var deferred=$q.defer();
			$http.post('/getQuizAve', {data: number}).success(function(data) {
				console.log(data);
				deferred.resolve(data)
			}).error(function()
			{
				deferred.reject();
			});
			return deferred.promise;			
		}*/
	}
});