global.$shed = global.$shed || {};
$shed.modules = $shed.modules || {};

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
        var identifiers = name.$value.split(".");
        var moduleResult = findParentModule(identifiers);
        if (!moduleResult) {
            throw new Error("Could not find module: " + name.$value);
        }
        var module = moduleResult.module;
        if (!module.evaluated) {
            module.evaluate();
        }
        
        var value = module.value;
        for (var depth = moduleResult.depth; depth < identifiers.length; depth += 1) {
            if (!Object.prototype.hasOwnProperty.call(value, identifiers[depth])) {
                throw new Error("Could not find module: " + name.$value);
            }
            value = value[identifiers[depth]];
        }
        return value;
    };
    
    var findParentModule = function(identifiers) {
        for (var depth = identifiers.length; depth >= 1; depth -= 1) {
            var module = modules[identifiers.slice(0, depth).join(".")];
            if (module) {
                return {
                    module: module,
                    depth: depth
                };
            }
        }
        return null;
    };
    
    var ImmutableArrayList = function(values) {
        return {
            forEach: values.forEach.bind(values),
            isEmpty: function() {
                return values.length === 0;
            },
            head: function() {
                return values[0];
            }
        };
    };
    
    $shed.lists = {
        create: function() {
            return ImmutableArrayList(Array.prototype.slice.call(arguments, 0));
        },
        createFromArray: function(array) {
            return ImmutableArrayList(array);
        }
    };
})();

var $import = $shed.import;
var $lists = $shed.lists;

var print = function(string) {
    process.stdout.write(string.$value);
};

var runtimeImport = $import;
