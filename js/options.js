$shed.exportModule("options", function() {
    var none = {
        map: function(R) {
            return function(func) {
                return none;
            }
        },
        orElse: function(func) {
            return func();
        },
        valueOrElse: function(func) {
            return func();
        }
    };
    var some = function(T) {
        return function(value) {
            var self = {
                map: function(R) {
                    return function(func) {
                        return some(R)(func(value));
                    }
                },
                orElse: function(func) {
                    return self;
                },
                valueOrElse: function(func) {
                    return value;
                }
            };
            return self;
        };
    };
    return {
        some: some,
        none: none
    };
});

