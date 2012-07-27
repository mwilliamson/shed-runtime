global.$shed = global.$shed || {};
$shed.modules = $shed.modules || {};

(function() {
    var modules = {
    };
        
    $shed.exportModule = function(name, func) {
        var evaluate = function() {
            var value = func();
            modules[name].value = value;
            modules[name].evaluated = true;
            var parts = name.split(".");
            var current = $shed.modules;
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
            if (!(identifiers[depth] in value)) {
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
    
    $shed.js = {
        import: function(name) {
            return $shed.import($shed.string(name));
        }
    };
})();
