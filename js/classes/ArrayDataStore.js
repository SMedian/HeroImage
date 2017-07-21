function ArrayDataStore() {
    const _objectIdMap = {}
    const _objects = []
    

    this.addUniqueObject = function(object, onDone) {
        addUniqueObject(object, onDone)
    }

    this.addUniqueObjects = function (objects, onDone) {
        if(!isArray(objects)) return
        objects.map((object) => {
            addUniqueObject(object)
        })
        if (onDone) onDone(_objects)
    }

    this.deleteObjectById = function(objectId, onDone) {
        var objectIndex = 0;
        _objects.map((object) => {
            const _objectId = object._id || object.id
            if(_objectId == objectId) {
                removeElementAtArrayIndex(_objects, objectIndex)
                onDone(_objects)
                return
            }
            objectIndex++
        })
        onDone(_objects)
    }

    function addUniqueObject(object, onDone) {
        if(!object) return
        if(_objectIdMap[object.id]) {
            if (onDone) onDone(_objects)
            return
        }
        _objectIdMap[object.id] = object
        _objects.push(object)
        if (onDone) onDone(_objects)
    }

    function getCount() {
        return _objects.length
    }
}