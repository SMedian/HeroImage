//define string replace all method
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//a function for checking if an value is a function
const StringUtils = function() {}
const ObjectUtils = function() {}
const FuncUtils = function() {}
const ArrayUtils = function() {}
const NetworkUtils = function() {}
const NumberUtils = function() {}

StringUtils.isValidHex = function(str) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str)
}

ObjectUtils.isObject = function (objToCheck) {
	return objToCheck && Object.prototype.toString.call(objToCheck) === '[object Object]';
}
ObjectUtils.isObj = ObjectUtils.isObject

ObjectUtils.forEachOwnProp = function(obj, callback) {
	var index = 0
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			callback(key, obj[key], index++)
		}
	}
}

ObjectUtils.clone = function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

FuncUtils.isFunc = function(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

ArrayUtils.forEachCachedLength = function(array, callback) {
	if(!ArrayUtils.isArray(array)) return false;
	if(!FuncUtils.isFunc(callback)) throw new Error("forEach() requires callback function.")
	for (var i = 0, len = array.length; i < len; i++) {
		(function(i) {
			callback(array[i])
		}(i))
	}
}

ArrayUtils.isArray = function(objToCheck) {
	return objToCheck && Object.prototype.toString.call( objToCheck ) === '[object Array]';
}

ArrayUtils.isEmptyArray = function (arr) {
	if(!ArrayUtils.isArray(arr)) return true
	return arr.length < 1
}

ArrayUtils.forEachCachedLength = function(array, callback) {
    if(!ArrayUtils.isArray(array)) return false;
    if(!FuncUtils.isFunc(callback)) throw new Error("forEach() requires callback function.")
    for (var i = 0, len = array.length; i < len; i++) {
        (function(i) {
            callback(array[i])
        }(i))
    }
}

ArrayUtils.mergeInPlace = function(array1, array2) {
    Array.prototype.push.apply(array1, array2);
}

ArrayUtils.clone = function(array) {
	if(!ArrayUtils.isArray(array)) return
	return array.slice(0);
}

NumberUtils.newGUID = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

NetworkUtils.runAjax = function(url, method, onSuccess, onError) {
	$.ajax({
		url: url,
		method: method,
		success: onSuccess,
		error: onError
	})
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

NetworkUtils.runAjax = function(url, method, onSuccess, onError) {
    $.ajax({
        url: url,
        method: method,
        success: onSuccess,
        error: onError
    })
}

NetworkUtils.getCurrentPathData = function() {
    const websiteLocation = window.location
    const websiteHostName = websiteLocation.host || websiteLocation.hostname
    const websitePathName = websiteLocation.pathname.trim()
    const pathArray = websitePathName.split( '/' )
    return {
        location: websiteHostName,
        host: websiteHostName,
        path: websitePathName,
        pathArray: pathArray || []
    }
}

NetworkUtils.getCurrentPathParamAtIndex = function(index) {
    let pathArray = NetworkUtils.getCurrentPathData().pathArray
    if(pathArray.length < index) return
    return pathArray[index]
}

NetworkUtils.getCurrentPathEquals = function(path) {
    return NetworkUtils.getCurrentPathData().path == path
}

NetworkUtils.getCurrentPathNthParamMatches = function(index, paramToCheck) {
    return NetworkUtils.getCurrentPathParamAtIndex(index) == paramToCheck
}

NetworkUtils.getCurrentLocationQueryParam = function(name) {
    var urlParamsString = window.location.search.replace('?', '')
    var params = urlParamsString.split("&")
    for (var i = 0; i < params.length; i++) {
        const paramParts = params[i].split('=')
        if (paramParts[0] == name) {
            return paramParts[1]
        }
    }
}
NetworkUtils.getQueryString = function() {
    return window.location.search.replace('?', '')
}

NetworkUtils.getUrlSrcParam = function() {
    return NetworkUtils.getCurrentLocationQueryParam('src')
}