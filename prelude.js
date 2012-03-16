global.$shed = global.$shed || {};
$shed.modules = $shed.modules || {};

var print = function(string) {
    process.stdout.write(string.$value);
};

(function() {
    var modules = {
    };
    
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
        
    $shed.exportModule = function(name, func) {
        var evaluate = function() {
            var value = func();
            modules[name].value = value;
            modules[name].evaluated = true;
            var parts = name.split(".");
            var current = $shed;
            for (var i = 0; i < parts.length - 1; i += 1) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        };
        modules[name] = {
            evaluate: evaluate,
            evaluated: false,
            value: null
        };
    };

    $shed.import = function(name) {
        var module = modules[name.$value];
        if (!module.evaluated) {
            module.evaluate();
        }
        return module.value;
    };
})();

var $import = $shed.import;
