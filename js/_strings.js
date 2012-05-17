$shed.exportModule("_strings", function() {
    var lists = $shed.js.import("lists");
    return {
        joinSequence: function(separator, sequence) {
            var jsString = lists.sequenceToList($shed.string)(sequence)
                .$toJsArray()
                .map(function(shedString) {
                    return shedString.$value;
                })
                .join(separator.$value);
            return $shed.string(jsString);
        }
    };
});
