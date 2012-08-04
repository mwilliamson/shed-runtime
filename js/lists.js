$shed.exportModule("lists", function() {
    var options = $shed.js.import("options");
    var tuples = $shed.js.import("tuples");
    var _sequences = $shed.js.import("_sequences");
    
    var sequenceToList = function(sequence) {
        var result = [];
        while (!_sequences.isNil(sequence)) {
            result.push(sequence.head());
            sequence = sequence.tail();
        }
        return $shed.lists.createFromArray(result);
    };

    // Assumes all inputs are the same length
    var zip = function() {
        var lists = Array.prototype.map.call(arguments, function(list) {
            return list.$toJsArray();
        });
        var result = [];
        for (var listsIndex = 0; listsIndex < lists[0].length; listsIndex += 1) {
            result[listsIndex] = tuples.$createFromArray(lists.map(function(list) {
                return list[listsIndex];
            }));
        };
        return $shed.lists.createFromArray(result);
    };
    
    return {
        sequenceToList: sequenceToList,
        zip: zip
    };
});
