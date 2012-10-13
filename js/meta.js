$shed.exportModule("meta", function() {
    var options = $shed.js.import("options");
    
    function get(obj, key) {
        return obj[key.$metaString];
    }
    
    function tryGet(obj, key) {
        var value = get(obj, key);
        if (value === undefined) {
            return options.none;
        } else {
            return options.some(value);
        }
    }
    
    function set(obj, key, value) {
        var newObj = Object.create(obj);
        newObj[key.$metaString] = value;
        return newObj;
    }
    
    function createKey(type, name) {
        // TODO: need to avoid collisions between distinct types with the same
        // name
        return MetaKey(represent(type).$value + "$" + name.$value);
    }
    
    var MetaKey = $shed.class(function(metaString) {
        return {
            $metaString: metaString,
            $class: MetaKey
        };
    }, "MetaKey");
    
    return {
        get: get,
        tryGet: tryGet,
        set: set,
        createKey: createKey
    };
});
