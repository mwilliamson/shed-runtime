global.$shed = global.$shed || {};

var print = function(value) {
    process.stdout.write(value);
};

var $number = function(value) {
    return {
        $value: value,
        equals: function(other) {
            return value === other.$value;
        },
        subtract: function(other) {
            return $number(value - other.$value);
        },
        add: function(other) {
            return $number(value + other.$value);
        },
        toString: function() {
            return value.toString();
        }
    };
};
    
var $exportModule = function(name, value) {
    var parts = name.split(".");
    var current = $shed;
    for (var i = 0; i < parts.length - 1; i += 1) {
        current[parts[i]] = current[parts[i]] || {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
};
