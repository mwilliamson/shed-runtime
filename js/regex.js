$shed.exportModule("regex", function() {
    var options = $shed.js.import("options");
    return {
        create: function(shedRegexString) {
            var RegexResult = function(jsResult) {
                return {
                    $isShedType: true,
                    capture: function(index) {
                        return $shed.string(jsResult[index.$value]);
                    }
                };
            };
            RegexResult.$isShedType = true;
            
            var regex = new RegExp(shedRegexString.$value);
            return {
                $isShedType: $shed.boolean(true),
                test: function(shedString) {
                    return $shed.boolean(regex.test(shedString.$value));
                },
                exec: function(shedString) {
                    var result = regex.exec(shedString.$value);
                    if (result === null) {
                        return options.none;
                    } else {
                        return options.some(RegexResult)(RegexResult(result));
                    };
                }
            };
        },
        escape: function(shedString) {
            return $shed.string(shedString.$value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
        }
    };
});
