//import node dependencies
var express = require("express");
var fileSystem = require('fs');
var http = require('http');	
var path = require("path");
var bodyParser = require("body-parser");
var io = require('socket.io');

/************************START UTIL METHODS*******************/
/************************START UTIL METHODS*******************/

//a function for checking if an value is a function
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

//a function for checking if a value is an array.
function isArray(arrayToCheck) {
	if( Object.prototype.toString.call( arrayToCheck ) === '[object Array]' ) {
	    return true;
	}
	return false;
}

//define String.contains convenience method
String.prototype.contains = function(it) { return this.indexOf(it) > -1}

//define string replace all method
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function isUrl(s) {
   var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
     var regex = new RegExp(strRegex);
     return regex.test(s);
}

/*
define a String function for formatting strings like printf() in Java.

String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');

with the same result:

ASP is dead, but ASP.NET is alive! ASP {2}

Found at http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
*/	
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

//define the includes function for arrays
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomIntEx(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomIntIn(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * A simple console log handler.
 * @param origin: the origin of this console log. Where is it coming from.
 * @param data: the data to be logged to the console.
 * Both params are required to log
 */
function consoleLog(origin, data, isError){
	var date = new Date();
	var errorLabel = isError && isError == true? "[ERROR]": "";
	if(origin && data) console.log("[" + origin + "]" + errorLabel + "[" + date + "]:: " + data);
	else console.log("[unknownOrigin]" + errorLabel + "[" + date + "]:: " + data);
}

/**
 * Generic error handler used by all endpoints
 * HTTP response codes: 1xx -> Informational, 2xx -> Success, 3xx -> Redirection, 4xx Client Error, 5xx -> Server Error
 * http://www.restapitutorial.com/httpstatuscodes.html
 */
function handleError(res, reason, message, code) {
	consoleLog("handleError", "ERROR: " + reason + " || message: " + message, true);
	//set the response's status as the error code or default http 500 "internal server error"
	res.status(code || 500).json({"error": reason, "errorMessage": message});
}

/************************END UTIL METHODS*******************/
/************************END UTIL METHODS*******************/

var request = require('request')

var app = express();
//create the path to the public files
app.use(express.static(__dirname + "/"));
app.use(bodyParser.json());


//init the app by listening on a designated port
var server = app.listen(process.env.PORT || 8585, function() {
	var port = server.address().port;
	io = io.listen(server);
	startChatIO();
	consoleLog("dbConxCallback", "App now running on port " + port);

	const imageSearchEndpointCache = {}
	const imageUrlBase64UrlMap = {}
	const UNSPLASHIMAGEAPI_APP_ID = 'c2e962aba1fd8e5c013758468fa0eca18c818673a6cc81b656c32d084669ce15'
	app.get('/service/search/image', function(req, res) {
		var endpoint, keywords, page
		try {
			page = req.query.page
			if(page < 1) page = 1

			keywords = req.query.keywords.trim()
			if(keywords.length < 3) {
				return handleError(res, new Error('Minimal search keywords length is 3.'))
			}

			endpoint = 'https://api.unsplash.com/search/photos/?client_id=' + UNSPLASHIMAGEAPI_APP_ID
			endpoint += '&query=' + keywords
			endpoint += '&page=' + page
		} catch(err) {
			return handleError(res, err)
		}
		
		if(imageSearchEndpointCache[endpoint]) {
			return res.status(200).json(JSON.parse(imageSearchEndpointCache[endpoint]))
		}
		
		request.get(endpoint, function (err, response, body) {
			if(err) return handleError(res, err, 'Could not search images by keywords: ' + req.query.keywords + ' and page: ' + req.query.page)
			imageSearchEndpointCache[endpoint] = body
			res.status(200).json(JSON.parse(body))

			cacheImageUrlBase64UrlsForSearchResults(body)
		})
	})

	app.post('/service/convert/image/url/base64', function(req, res) {
		getImageUrlBase64Url(req.query.url, (base64Url) => {
			res.status(200).json({
				base64Url: base64Url
			})
		}, (err) => {
			res.status(404).json(err)
		})
	})

	function cacheImageUrlBase64UrlsForSearchResults(body) {
		try {
			const results = JSON.parse(body).results
			results.forEach((result) => {
				const imageUrl = result.urls.regular
				if(imageUrlBase64UrlMap[imageUrl]) {
					broadCastImageUrlBase64Url(imageUrl, imageUrlBase64UrlMap[imageUrl])
					return
				}

				getImageUrlBase64Url(imageUrl, (base64Url) => {
					imageUrlBase64UrlMap[imageUrl] = base64Url
					broadCastImageUrlBase64Url(imageUrl, base64Url)
				}, (err) => {})
			})
		} catch(err) {}
	}

	function getImageUrlBase64Url(imageUrl, onSuccess, onFail) {
			var request = require('request').defaults({ encoding: null });
			request.get(imageUrl, function (err, response, body) {
				if (err && onFail) return onFail(err)
				onSuccess("data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64'))
			})
		}
});

/*=========================================START SOCKET.IO SETUP=========================================*/
/*=========================================START SOCKET.IO SETUP=========================================*/

var broadCastImageUrlBase64Url
function startChatIO() {
	var numClients = 0;

	broadCastImageUrlBase64Url = function(imageUrl, base64Url) {
		try{
		  //consoleLog("startChatIO", 'RECEIVED MESSAGE:' +  JSON.stringify(message));

		  //consoleLog("startChatIO", 'broadcasting message');
		  //send messages to clients waiting for messages on the message's publicationId
		  io.sockets.emit('imageUrlBase64Url', {
		    payload: {
					imageUrl: imageUrl,
					base64Url: base64Url
				}
		  });
		  //console.log('broadcast complete to: ' + 'messagePID' + message.publicationId);
		} catch (err) {
			consoleLog("startChatIO", "Error occurred: " + err.message, true);
		}
	}

	function broadcastNumClients() {
		try{
		  //consoleLog("startChatIO", 'RECEIVED MESSAGE:' +  JSON.stringify(message));

		  //consoleLog("startChatIO", 'broadcasting message');
		  //send messages to clients waiting for messages on the message's publicationId
		  io.sockets.emit('numClients', {
		    payload: numClients
		  });
		  //console.log('broadcast complete to: ' + 'messagePID' + message.publicationId);
		} catch (err) {
			consoleLog("startChatIO", "Error occurred: " + err.message, true);
		}
	}

	//var clients = [];
	io.on('connection', function (socket) {
		//clients.push(socket);
		numClients++;
		broadcastNumClients();

		socket.on('message', function (message) {
			try{
			  //consoleLog("startChatIO", 'RECEIVED MESSAGE:' +  JSON.stringify(message));

			  //consoleLog("startChatIO", 'broadcasting message');
			  //send messages to clients waiting for messages on the message's publicationId
			  io.sockets.emit('message-pid-' + message.publicationId, {
			    payload: {publicationId: message.publicationId, userId: message.userId, 'message': message}
			  });
			  //console.log('broadcast complete to: ' + 'messagePID' + message.publicationId);
			} catch (err) {
				consoleLog("startChatIO", "Error occurred: " + err.message, true);
			}
		});

		socket.on('disconnect', function() {
			//clients.push(socket);
			numClients--;
			broadcastNumClients();
		});
	});

	//set interval to update 
	setInterval(function(){
		broadcastNumClients();
	}, 60 * 1000);
}

/*=========================================END SOCKET.IO SETUP=========================================*/
/*=========================================END SOCKET.IO SETUP=========================================*/