var fs=require('fs');
var sentiment=require('sentiment');
var LineByLineReader = require('line-by-line');
lr = new LineByLineReader('riders.json');

lr.on('error', function(err)
{
	console.log("ERROR:"+err);
});

lr.on('line', function(line)
{
	lr.pause();
	var jsoned=JSON.parse(line);
	if(jsoned.disconnect==undefined)
	{
		var processedLine={};
		processedLine.text=jsoned.text;
		processedLine.time=jsoned.time;
		processedLine.user={};
		processedLine.user.screen_name=jsoned.user.screen_name;
		sentiment(jsoned.text, function(err, result){
			processedLine.sentiment=result.score;
			console.log(processedLine.sentiment);
		});

		fs.appendFile('processedRiders.json', JSON.stringify(processedLine)+"\n", function (err) {
			console.log("Append Error: "+err);
		});
	}
	lr.resume();
});

lr.on('end', function()
	{
		console.log("LINE PROCESSING COMPLETED SUCCESSFULLY!!");
	});