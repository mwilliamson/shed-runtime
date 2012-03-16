global.$shed = global.$shed || {};
$shed.modules = $shed.modules || {};

var print = function(string) {
    process.stdout.write(string.$value);
};

(function() {
    var number = $shed.number = function(value) {
        return {
            $value: value,
            equals: function(other) {
                return value === other.$value;
            },
            subtract: function(other) {
                return number(value - other.$value);
            },
            add: function(other) {
                return number(value + other.$value);
            },
            toString: function() {
                return string(value.toString());
            }
        };
    };
    
    var string = $shed.string = function(value) {
        return {
            $value: value,
            concat: function(other) {
                return string(value + other.$value);
            }
        };
    };
        
    $shed.exportModule = function(name, value) {
        var parts = name.split(".");
        var current = $shed;
        for (var i = 0; i < parts.length - 1; i += 1) {
            current[parts[i]] = current[parts[i]] || {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    };
})();
