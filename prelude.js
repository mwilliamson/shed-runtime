var dummyType = {
    $isShedType: true
};

var matchClass = function(clazz, func) {
    return {
        matches: function(value) {
            return $shed.boolean(classOf(value).equals(clazz));
        },
        apply: func
    };
};

var matchDefault = function(func) {
    return {
        matches: function(value) {
            return $shed.boolean(true);
        },
        apply: func
    };
};

var match = function(value) {
    var cases = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < cases.length; i += 1) {
        if (cases[i].matches(value)) {
            return cases[i].apply(value);
        }
    }
};

(function() {
    $shed.unit = {};
    
    $shed.function = function(func) {
        func.$define = function(name) {
            return func;
        };
        return func;
    };
    
    $shed.class = function(constructor, name) {
        var clazz = function() {
            var self = constructor.apply(this, arguments);
            self.$class = clazz;
            return self;
        };
        clazz.$define = function(name) {
            return $shed.class(constructor, name);
        };
        clazz.equals = function(other) {
            //~ console.log("clazz: " + clazz.toRepresentation().$value);
            //~ console.log("other: " + other.toRepresentation().$value);
            return clazz === other;
        };
        var representation = name ? "Class<" + name + ">" : "Class<$Anonymous>";
        clazz.toRepresentation = function() {
            return $shed.string(representation);
        };
        clazz.$isShedType = true;
        return clazz;
    };
    
    var number = $shed.number = function(value) {
        return {
            $value: value,
            equals: function(other) {
                return boolean(value === other.$value);
            },
            greaterThan: function(other) {
                return boolean(value > other.$value);
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
            length: function(other) {
                return number(value.length);
            },
            sliceFrom: function(index) {
                return string(value.slice(index.$value));
            },
            substring: function(startIndex, endIndex) {
                return string(value.substring(startIndex.$value, endIndex.$value));
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
    
    var boolean = $shed.boolean = function(value) {
        return value;
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
            },
            toSequence: function() {
                // HACK: should really define ImmutableArrayList later to avoid this late import
                var sequences = $shed.js.import("sequences");
                var T = null; // TODO: ImmutableArrayList should really be type parameterised
                
                var sequence = function(index) {
                    if (values.length === index) {
                        return sequences.nil;
                    } else {
                        return sequences.lazyCons(T)(
                            values[index],
                            function() {
                                return sequence(index + 1);
                            }
                        );
                    }
                };
                
                return sequence(0);
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

var classOf = function(value) {
    return value.$class;
};

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
    return Array.prototype.slice.call(arguments, 0).every(function(value) {
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

var tuple = function(values) {
    return values;
};

var pack = function(func) {
    return function(tuple) {
        return func.apply(this, tuple);
    };
};

var range = function(from, to) {
    var result = [];
    for (var i = from.$value; i < to.$value; i += 1) {
        result.push($shed.number(i));
    }
    return $shed.lists.createFromArray($shed.number)(result);
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

