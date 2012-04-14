$shed.exportModule("lists", function() {
    var options = $shed.js.import("options");
    var sequences = $shed.js.import("sequences");
    var sequenceToList = function(T) {
        return function(sequence) {
            var result = [];
            sequences.forEach(T)(function(value) {
                result.push(value);
            }, sequence);
            return $shed.lists.createFromArray(T)(result);
        };
    };
    return {
        sequenceToList: sequenceToList
    };
});
