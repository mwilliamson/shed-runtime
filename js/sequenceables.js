$shed.exportModule("sequenceables", function() {
    var sequences = $shed.js.import("sequences");
    var head = function(T) {
        return function(sequenceable) {
            return sequences.head(T)(sequenceable.toSequence());
        };
    };
    return {
        head: head
    };
});
