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
            var parts = name.split("/");
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

    $shed.jsImport = function(name) {
        // TODO: we should remove any usages with dots, so this only returns modules
        var parts = name.split(".");
        var value = importModule(parts[0]);
        for (var partIndex = 1; partIndex < parts.length; partIndex++) {
            value = value[parts[partIndex]];
        }
        return value;
    }

    $shed.import = function(name) {
        return $shed.jsImport(name.$value);
    };
    
    function importModule(name) {
        var module = findModule(name);
        if (!module) {
            throw new Error("Could not find module: " + name);
        }
        if (!module.evaluated) {
            module.evaluate();
        }
        return module.value;
    }
    
    function findModule(name) {
        return modules[name];
    };
    
    $shed.js = {
        import: $shed.jsImport
    };
})();
