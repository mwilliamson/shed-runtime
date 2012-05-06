$shed.exportModule("_strings", function() {
    var lists = $shed.js.import("lists");
    return {
        join: function(separator, sequenceable) {
            var jsString = lists.sequenceToList($shed.string)(sequenceable.toSequence())
                .$toJsArray()
                .map(function(shedString) {
                    return shedString.$value;
                })
                .join(separator.$value);
            return $shed.string(jsString);
        }
    };
});
