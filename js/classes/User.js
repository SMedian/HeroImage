/**
 * Created by lwdthe1 on 3/26/2016.
 */
var User, CurrentUser
(function(){
    var currentUser
    User = function(accessToken, data) {
        const isCurrentUser = CurrentUser.getId() == data.id
        this.accessToken = accessToken
        this.id = data.id
        this.username = data.username
        this.url = data.url
        this.name = data.name
        this.bio = data.bio
        this.email = data.email
        this.imageUrl = data.imageUrl
        this.isWriter = data.isWriter
    }

    CurrentUser = function() {
        
    }

    CurrentUser.set = function (accessToken, dbUser) {
        if(!accessToken) return false
        if(!dbUser) return false
        currentUser = new User(accessToken, dbUser)
        return currentUser
    }

    CurrentUser.get = function() {
        return currentUser
    }

    User.getCurrent = CurrentUser.get
}())


User.prototype.setId = function(id) {
    this.id = id;
};

User.prototype.setPubs = function(pubs) {
    this.pubs = pubs;

    //try to store the pubs in local storage if local storage is available
    if(typeof(Storage) !== "undefined"){
        var pubsStringified = JSON.stringify(pubs);

        /*we store the pubs in the browser's local storage instead of cookies 
        because it may be too large for cookies*/
        localStorage.setItem(COOKIE_KEYS.LIST_IDS, pubsStringified);
    } else {
        // Sorry! No Web Storage support..
    }
};

User.prototype.addPub = function(pub) {
    this.pubs.push(pub);
};

User.prototype.getId = function() {
    return this.id;
};

User.prototype.getUsername = function() {
    return this.username;
};

User.prototype.getEmail = function() {
    return this.email;
};

User.prototype.getUrl = function() {
    return this.url;
};
User.prototype.getImageUrl = function() {
    return this.imageUrl;
};
User.prototype.getAccessToken = function() {
    return this.accessToken;
};
User.prototype.getRefreshToken = function() {
    return this.refreshToken;
};
User.prototype.getGooglePersonId = function() {
    return this.googlePersonId;
};

User.prototype.getPubs = function() {
    return this.pubs;
};

User.prototype.setEmail = function(email) {
    this.email = email;
    setCookie(COOKIE_KEYS.EMAIL, email, 50);
};

User.prototype.removeAllPubs = function() {
    this.pubs = [];
    localStorage.removeItem(COOKIE_KEYS.LIST_IDS);
}

CurrentUser.getId = function() {
    const user = User.getCurrent()
    if(!user) return
    return user.getId()
}

CurrentUser.getAccessToken = function() {
    const user = User.getCurrent()
    if(!user) return
    return user.getAccessToken()
}

CurrentUser.getEmail = function() {
    try {
        return CurrentUser.get().email
    } catch(err) {debugger}
}

CurrentUser.hasValidCreds = function() {
    const user = User.getCurrent()
    if(!user) return false
    return User.isValidId(user.getId()) && User.isValidAccessToken(user.getAccessToken())
}

User.isValidId = function (dbObjectId) {
    if(!dbObjectId) return false
    return VALID_OBJECT_ID_REGEX.test(dbObjectId)
}

User.isValidAccessToken = function (dbAccessToken) {
    if(!dbAccessToken) return false
    return dbAccessToken.indexOf('-') > 0
}

String.prototype.contains = function(it) { return this.indexOf(it) > -1}