$shed.exportModule("sequences", function() {    
    var _sequences = $shed.js.import("_sequences");
    var options = $shed.js.import("options");
    var nil = _sequences.nil;
    
    var head = function(T) {
        return function(sequence) {
            if (sequence === nil) {
                return options.none;
            } else {
                return options.some(T)(sequence.head());
            }
        };
    };
    
    var lazyCons = function(T) {
        return function(head, deferredTail) {
            return {
                head: function() {
                    return head;
                },
                tail: deferredTail
            };
        };
    };
    
    var forEachTrampolined = function(T) {
        return function(func, sequence) {
            if (sequence === nil) {
                return null;
            } else {
                func(sequence.head());
                return function() {
                    return forEachTrampolined(T)(func, sequence.tail());
                };
            }
        };
    };
    var forEach = function(T) {
        return function(func, sequence) {
            var next = function() {
                return forEachTrampolined(T)(func, sequence);
            };
            while (next !== null) {
                next = next();
            }
        };
    };
    var singleton = function(T) {
        return function(value) {
            return _sequences.cons(T)(value, _sequences.nil);
        };
    };
        
    return {
        forEach: forEach,
        nil: nil,
        head: head,
        lazyCons: lazyCons,
        singleton: singleton
    };
});
