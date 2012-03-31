global.$shed = global.$shed || {};
$shed.modules = $shed.modules || {};

var dummyType = {
    $isShedType: true
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
        var self = {
            $value: value,
            concat: function(other) {
                return string(value + other.$value);
            },
            equals: function(other) {
                return value === other.$value;
            },
            toString: function() {
                return self;
            },
            toRepresentation: function() {
                return string(JSON.stringify(value));
            }
        };
        return self;
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
            map: function(func) {
                return ImmutableArrayList(values.map(func));
            },
            filter: function(predicate) {
                return ImmutableArrayList(values.filter(predicate));
            },
            foldLeft: function(initialValue, func) {
                return values.reduce(func, initialValue);
            },
            isEmpty: function() {
                return values.length === 0;
            },
            length: function() {
                return number(values.length);
            },
            head: function() {
                return values[0];
            },
            append: function(value) {
                return ImmutableArrayList(values.concat([value]));
            },
            concat: function(other) {
                return ImmutableArrayList(values.concat(other.$toJsArray()));
            },
            $toJsArray: function() {
                return values;
            }
        };
    };
    
    $shed.lists = {
        create: function(T) {
            return function() {
                return ImmutableArrayList(Array.prototype.slice.call(arguments, 0));
            };
        },
        createFromArray: function(T) {
            return function(array) {
                return ImmutableArrayList(array);
            };
        }
    };
})();

var $import = $shed.import;
var $lists = $shed.lists;

var print = function(string) {
    process.stdout.write(string.$value);
};

var runtimeImport = $import;
var listOf = withTypeParameterInference($shed.lists.create);
var String = $shed.string;
var not = function(value) {
    return !value;
};
var and = function() {
    return Array.prototype.slice.call(arguments, 0).some(function(value) {
        return !!value;
    });
};

var representation = function(value) {
    if (value.toRepresentation) {
        return value.toRepresentation();
    } else {
        return $shed.string("<object without toRepresentation>");
    }
};

var Nothing = dummyType;
var emptyList = listOf(Nothing)();
var Func = function() {
    return dummyType;
};
var List = function() {
    return dummyType;
};
var join = function(shedJoiner, shedSequence) {
    var jsStrings = shedSequence.map(function(shedString) {
        return shedString.$value;
    }).$toJsArray();
    return $shed.string(jsStrings.join(shedJoiner.$value));
};

// Assumes all inputs are the same length
var zip = function() {
    var lists = Array.prototype.map.call(arguments, function(list) {
        return list.$toJsArray();
    });
    var result = [];
    for (var listsIndex = 0; listsIndex < lists[0].length; listsIndex += 1) {
        result[listsIndex] = tuple(lists.map(function(list) {
            return list[listsIndex];
        }));
    };
    return $shed.lists.createFromArray()(result);
};

var tuple = function(values) {
    return values;
};

var pack = function(func) {
    return function(tuple) {
        return func.apply(this, tuple);
    };
};

var any = function(list) {
    return list.$toJsArray().some(function(value) {
        return value;
    });
};

var all = function(list) {
    return list.$toJsArray().every(function(value) {
        return value;
    });
};

var range = function(from, to) {
    var result = [];
    for (var i = from.$value; i < to.$value; i += 1) {
        result.push($shed.number(i));
    }
    return $shed.lists.createFromArray($shed.number)(result);
};

var none = {
    $toJsArray: function() {
        return [];
    }
};

var some = function(value) {
    return {
        $toJsArray: function() {
            return [value];
        }
    };
};

var concat = function(first, second) {
    return $shed.lists.createFromArray()(first.$toJsArray().concat(second.$toJsArray()));
};

// Yes! It's a hack! To get around the fact that the Shed compiler does not
// currently implement type inference, and therefore cannot infer type parameters,
// we infer them at runtime. Note this will fail miserably when attempting
// to infer type parameters when the arguments of a function are types
// (but I imagine that this is sufficiently rare that it shouldn't bite us.
// Hopefully).
// More critically, it means that the type parameters will all be undefined
// within the function. Use with caution.
function withTypeParameterInference(func) {
    return function() {
        var containsShedType = Array.prototype.some.call(arguments, isShedType);
        if (containsShedType) {
            return func.apply(this, arguments);
        } else {
            return func().apply(this, arguments);
        }
    };
}

function isShedType(shedObj) {
    return shedObj.$isShedType;
};
