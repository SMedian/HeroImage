const APP_ORIGINAL_SEO_MAP = {
    title: "SMedian",
    description: "Medium editors and writers meet."
}



const SERVER_API_KEY_PARAM = "apiKey=p8q937b32y2ef8sdyg"

String.prototype.contains = function(it) { return this.indexOf(it) > -1}

function _id(id) {
	return document.getElementById(id);
}

function isValidUrl(str) {
	if(!str) return false	
	var expressionHttp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
	var expressionHttps = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
	var regexHttp = new RegExp(expressionHttp);
	var regexHttps = new RegExp(expressionHttps);
	return regexHttp.match(str) || regexHttps.match(str)
}

function prepareHTTPUrlOrEmailAddress(url) {
	if(!url || !url.length) return url
	var newUrl = url.trim()
	if (newUrl.indexOf('@') > -1 && newUrl.indexOf('/') < 0) {
		newUrl = 'mailto:' + trimUrl(newUrl)
	} else {
		newUrl = 'http://' + trimUrl(newUrl)
	}

	function trimUrl(url) {
		if(!url) return url
		var trimmedUrl = (url.replace('https://', '').replace('http://', '').replace('mailto:', '')).trim()
		return trimmedUrl.replace(/\/$/, "")
	}
	return newUrl
}


//a function for checking if a value is an array.
function isArray(arrayToCheck) {
	if( Object.prototype.toString.call( arrayToCheck ) === '[object Array]' ) {
	    return true;
	}
	return false;
}

const isEmptyArray = function (arr) {
	if(!isArray(arr)) return true
	return arr.length < 1
}

const forEachCachedLength = function(array, callback) {
	if(!isArray(array)) return false;
	if(!isFunc(callback)) throw new Error("forEach() requires callback function.")
	for (var i = 0, len = array.length; i < len; i++) {
		(function(i) {
			callback(array[i])
		}(i))
	}
}

function dispatchEvent(id, data) {
	var event
	if(data) event = new CustomEvent(id, { detail: data })
	else event = new Event(id)

	document.dispatchEvent(event);
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

const removeElementAtArrayIndex = function(array, index) {
	if (index > -1 && !isEmptyArray(array)) {
		var element = array[index]
    array.splice(index, 1);
		return element
	}
}

function loginGoogler(ngOpts, preLoginData) { 
	if(!ngOpts) return
	var $scope = ngOpts.scope
	var $window = ngOpts.window
	var $location = ngOpts.location
	var Google = ngOpts.Google
	if (!preLoginData) {
		preLoginData = Cookies.newPreloginData($location.absUrl())
	}
	preLoginData.setUrl($location.absUrl())
	Cookies.setPreloginData(preLoginData)
	NProgress.start();

	Google.getAuthUrl(preLoginData)
		.then(function(url) {
			if(url){
				//data binding not working
				$scope.loginStatus = "Redirecting to Google.com to login ...";
				$window.location.href = url
			}
			NProgress.done();
		}, function(response) {
			//something went wrong
			console.log("[$scope.loginGoogler] ERROR:" + response);
			$scope.loginStatus = response;
			NProgress.done();
		});
}

function loginMediumer(ngOpts, preLoginData) { 
	if(!ngOpts) return
	var $scope = ngOpts.scope
	var $window = ngOpts.window
	var $location = ngOpts.location
	var Medium = ngOpts.Medium

	if (!preLoginData) {
		preLoginData = Cookies.newPreloginData($location.absUrl())
	}
	preLoginData.setUrl($location.absUrl())
	Cookies.setPreloginData(preLoginData)

	NProgress.start();

	Medium.getAuthUrl(preLoginData)
		.then(function(url) {
			
			if(url){
				//data binding not working
				$scope.loginStatus = "Redirecting to Medium.com to login ...";
				$window.location.href = url
			}
			NProgress.done();
		}, function(response) {
			//something went wrong
			console.log("[$scope.loginMediumer] ERROR:" + response);
			$scope.loginStatus = response;
			NProgress.done();
		});
}

function returnToPreLoginLocation(opts) {
    NProgress.done();
    if(!opts) opts = {}
	var defaultLocationPath = opts.defaultPath || "/"
    const loginErrorCode = opts.errorCode
    
    if((defaultLocationPath + "").indexOf("/") != 0) defaultLocationPath = "/" + defaultLocationPath
    var preLoginLocationUrl = Cookies.getPreloginUrl()
    preLoginLocationUrl = (preLoginLocationUrl && preLoginLocationUrl) || defaultLocationPath || ""
    if(preLoginLocationUrl.indexOf("?") < 0) {
        preLoginLocationUrl += "?sm-src=login"
    } else {
        preLoginLocationUrl += "&sm-src=login"
    }
	if(loginErrorCode) preLoginLocationUrl += "&sm-login-ec=" + loginErrorCode
	if(preLoginLocationUrl.indexOf('/') != 0) preLoginLocationUrl = '/' + preLoginLocationUrl
    window.location.href = preLoginLocationUrl 
}

const getSSRCData = () => {
	return __ssr__CData || {}
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a flash,
  // so some of these are just precautions. However in IE the element
  // is visible whilst the popup box asking the user for permission for
  // the web page to copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    //console.log('Copying text command was ' + msg + ": " + text);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}

//define string replace all method
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function toPrettyDate(date) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear();
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}