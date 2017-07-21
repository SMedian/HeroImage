'use strict';

function ReferencesManager() {
    const users = new DbReferenceManger()
    const list = new DbReferenceManger()

    this.getUsers = function() {
        return users
    }

    this.getLists = function() {
        return lists
    }

    function DbReferenceManger() {
        const objectIdMap = {}

        this.getById = function(id) {
            return objectIdMap[id]
        }

        this.putById = function(id, object) {
            objectIdMap[id] = object
        }

        this.removeById = function(id) {
            var obj = objectIdMap[id]
            delete objectIdMap[id]
            return obj
        }
    }

    this.extractUserReferences = function(scTypedArray) {
        try {
            const values = scTypedArray.values
            const references = scTypedArray.references
            if(!references) return
            const userReferencesMap = references["users"]
            if(!userReferencesMap) return
            for (var userId in userReferencesMap) {
                if (userReferencesMap.hasOwnProperty(userId)) {
                    users.putById(userId, userReferencesMap[userId])
                }
            }
        } catch (err) {

        }
    }

    this.extractUserReferenceById = function(userId, references) {
        try {
            if(!userId) return
            if(!references) return
            const userReferencesMap = references["users"]
            if(!userReferencesMap) return
            users.putById(userId, userReferencesMap[userId])
        } catch (err) {

        }
    }

    this.addUserReference = function(rootObject) {
        if(!rootObject) return
        if(!rootObject.user) return
        try {
            const user = rootObject.user
            users.putById(user._id || user.id, user)
        } catch (err) {}
    }

    this.addUser = function(user) {
        if(!user) return
        try {
            users.putById(user._id || user.id, user)
        } catch (err) {}
    }
}

