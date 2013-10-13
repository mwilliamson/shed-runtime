$shed.exportModule("lists", function() {
    var options = $shed.js.import("options");
    var tuples = $shed.js.import("tuples");
    var _sequenceItems = $shed.js.import("_sequenceItems");
    
    var sequenceToList = function(sequence) {
        var result = [];
        var item = sequence.currentItem();
        while (!_sequenceItems.isNil(item)) {
            result.push(item.head());
            item = item.tail().currentItem();
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
    
    var concat = function(listOfLists) {
        var result = [];
        
        listOfLists.forEach(function(list) {
            list.forEach(function(value) {
                result.push(value);
            });
        });
        
        return $shed.lists.createFromArray(result);
    };
    
    var reversed = function(sequence) {
        // TODO: fix circular imports
        var sequences = $shed.js.import("sequences");
        return sequenceToList(sequences.reversed(sequence));
    };
    
    return {
        sequenceToList: sequenceToList,
        reversed: reversed,
        zip: zip,
        concat: concat
    };
});
