$shed.exportModule("_json", function() {
    return {
        parseString: function(shedString) {
            return $shed.string(JSON.parse(shedString.$value));
        },
        stringifyString: function(shedString) {
            return $shed.string(JSON.stringify(shedString.$value));
        }
    };
});
