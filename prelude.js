var dummyType = {
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
    throw new Error("no case found for match, value was: " + represent(value).$value);
};

(function() {
    Function.prototype.$define = function(name) {
        return this;
    };
    
    $shed.function = function(func) {
        return func;
    };
    
    var shedClassPrototype = {
        equals: function(other) {
            return this === other;
        },
        _jsName: function() {
            return this.$name ? this.$name : "$Anonymous";
        },
        represent: function() {
            return $shed.string("Class<" + this._jsName() + ">");
        },
        identifier: function() {
            return $shed.string(this._jsName());
        }
    };
    shedClassPrototype.__proto__ = Function.prototype;
    
    $shed.class = function(constructor, name) {
        var clazz = function() {
            var self = constructor.apply(this, arguments);
            self.$class = clazz;
            return self;
        };
        clazz.$constructor = constructor;
        clazz.$name = name;
        
        clazz.__proto__ = shedClassPrototype;
        
        clazz.$define = function(name) {
            return $shed.class(constructor, name);
        };
        return clazz;
    };
    
    $shed.Unit = $shed.class(function() { }, "Unit");
    $shed.unit = {$class: $shed.Unit};
    $shed.Boolean = {$class: $shed.class(function() { }, "Boolean")};
    
    $shed.Function = $shed.class(function() { }, "Function");
    
    var number = $shed.number = $shed.class(function(value) {
        return {
            $value: value,
            equals: function(other) {
                return boolean(value === other.$value);
            },
            lessThan: function(other) {
                return boolean(value < other.$value);
            },
            lessThanOrEqual: function(other) {
                return boolean(value <= other.$value);
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
    }, "Double");
    
    var string = $shed.string = $shed.class(function(value) {
        return new String(value);
    }, "String");
    
    function String(value) {
        this.$value = value;
    }
    
    String.prototype.concat = function(other) {
        return string(this.$value + other.$value);
    };
    String.prototype.equals = function(other) {
        return this.$value === other.$value;
    };
    String.prototype.length = function(other) {
        return number(this.$value.length);
    };
    String.prototype.sliceFrom = function(index) {
        return string(this.$value.slice(index.$value));
    };
    String.prototype.substring = function(startIndex, endIndex) {
        return string(this.$value.substring(startIndex.$value, endIndex.$value));
    };
    String.prototype.toString = function() {
        return self;
    };
    String.prototype.represent = function() {
        return string(JSON.stringify(this.$value));
    };
    
    //~ var string = $shed.string = $shed.class(function(value) {
        //~ var self = {
            //~ $value: value,
            //~ concat: function(other) {
                //~ return string(value + other.$value);
            //~ },
            //~ equals: function(other) {
                //~ return value === other.$value;
            //~ },
            //~ length: function(other) {
                //~ return number(value.length);
            //~ },
            //~ sliceFrom: function(index) {
                //~ return string(value.slice(index.$value));
            //~ },
            //~ substring: function(startIndex, endIndex) {
                //~ return string(value.substring(startIndex.$value, endIndex.$value));
            //~ },
            //~ toString: function() {
                //~ return self;
            //~ },
            //~ represent: function() {
                //~ return string(JSON.stringify(value));
            //~ }
        //~ };
        //~ return self;
    //~ }, "String");
    
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
            last: function() {
                return values[values.length - 1];
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
                
                var sequence = function(index) {
                    if (values.length === index) {
                        return sequences.nil;
                    } else {
                        return sequences.lazyCons(
                            values[index],
                            function() {
                                return sequence(index + 1);
                            }
                        );
                    }
                };
                
                return sequence(0);
            },
            represent: function() {
                var toJsString = function(value) {
                    return value.$value;
                };
                var elements = values.map(represent).map(toJsString).join(", ");
                return $shed.string("ImmutableArrayList([" + elements + "])");
            },
            equals: function(other) {
                var otherArray = other.$toJsArray();
                if (values.length !== otherArray.length) {
                    return false;
                } else {
                    for (var i = 0; i < values.length; i += 1) {
                        if (!equal(values[i], otherArray[i])) {
                            return false;
                        }
                    }
                    return true;
                }
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

var classOf = function(value) {
    if (value.$class) {
        return value.$class;
    } else if (isFunction(value)) {
        return $shed.Function;
    } else if ($isBoolean(value)) {
        return $shed.Boolean;
    } else {
        throw new Error("Could not determine class of value: " + (value.toString().$value || value.toString()));
    }
    
    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
    }

};

var $import = $shed.import;
var $lists = $shed.lists;

var print = function(string) {
    process.stdout.write(string.$value);
};

var runtimeImport = $import;
var listOf = $shed.lists.create;
var String = $shed.string;
var Unit = $shed.Unit;
var not = function(value) {
    return !value;
};
var and = function() {
    return Array.prototype.slice.call(arguments, 0).every(function(value) {
        return !!value;
    });
};
var or = function() {
    return Array.prototype.slice.call(arguments, 0).some(function(value) {
        return !!value;
    });
};

// TODO: should detect whether or not an object has an appropriate
// representation more safely
var represent = function(value) {
    if (value.represent) {
        return value.represent();
    } else if (value.struct) {
        return represent(value.struct());
    } else if ($isBoolean(value)) {
        return $shed.string(value ? "true" : "false");
    } else {
        return $shed.string("<" + represent(classOf(value)).$value + " without represent>");
    }
};

var Nothing = dummyType;
var emptyList = listOf();
var Func = function() {
    return dummyType;
};
var List = function() {
    return dummyType;
};

var Tuple = $shed.class(function() {
    var values = Array.prototype.slice.call(arguments, 0);
    return {
        $values: values,
        equals: function(other) {
            if (classOf(other) !== Tuple) {
                return false;
            }
            if (values.length !== other.$values.length) {
                return false;
            }
            for (var i = 0; i < values.length; i += 1) {
                if (!equal(values[i], other.$values[i])) {
                    return false;
                }
            }
            return true;
        },
        represent: function() {
            var valuesString = values.map(function(value) {
                return represent(value).$value;
            }).join(", ");
            return $shed.string(
                "tuple(".concat(valuesString).concat(")")
            );
        },
        append: function(value) {
            var newValues = values.slice(0);
            newValues.push(value);
            return tuple.apply(this, newValues);
        },
        map: function(func) {
            return func.apply(null, values);
        }
    };
}, "Tuple");

var tuple = Tuple;

var tupleFromSequence = function(sequence) {
    var values = [];
    while (sequence.head) {
        values.push(sequence.head());
        sequence = sequence.tail();
    }
    return tuple.apply(null, values);
};

var pack = function(func) {
    return function(tuple) {
        return func.apply(this, tuple.$values);
    };
};

var range = function(from, to) {
    var result = [];
    for (var i = from.$value; i < to.$value; i += 1) {
        result.push($shed.number(i));
    }
    return $shed.lists.createFromArray(result);
};

var equal = function(first, second) {
    if (first.equals) {
        return first.equals(second);
    } else if (first.struct && second.struct) {
        return equal(first.struct(), second.struct());
    } else if ($isBoolean(first) && $isBoolean(second)) {
        return first === second;
    } else {
        throw new Error("arguments are not equalable");
    }
};

var $isBoolean = function(value) {
    return value === true || value === false;
};

var lazyFunction = function(func) {
    var impl = function() {
        impl = func();
        return impl.apply(this, arguments);
    };
    return function() {
        return impl.apply(this, arguments);
    };
};
