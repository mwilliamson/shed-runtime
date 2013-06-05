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
    $shed.isJsFunction = function(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
    }

    $shed.memberAccess = function(obj, member) {
        if (obj.$usesThis && $shed.isJsFunction(member)) {
            return member.bind(obj);
        } else {
            return member;
        }
    };
    
    Function.prototype.$define = function(name) {
        return this;
    };
    
    $shed.function = function(func) {
        return func;
    };
    
    var shedClassPrototype = {
        $usesThis: true,
        equals: function(other) {
            return this === other;
        },
        $_jsName: function() {
            return this.$className ? this.$className : "$Anonymous";
        },
        _represent: function() {
            return $shed.string("Class<" + this.$_jsName() + ">");
        },
        identifier: function() {
            return $shed.string(this.$_jsName());
        },
        $define: function(name) {
            return $shed.class(this, name);
        }
    };
    shedClassPrototype.__proto__ = Function.prototype;
    
    $shed.class = function(constructor, name) {
        constructor.$className = name;
        constructor.__proto__ = shedClassPrototype;
        return constructor;
    };
    
    $shed.Unit = $shed.class(function() { }, "Unit");
    $shed.unit = {$class: $shed.Unit};
    $shed.Boolean = {$class: $shed.class(function() { }, "Boolean")};
    
    $shed.Function = $shed.class(function() { }, "Function");
    
    var number = $shed.number = $shed.class(function(value) {
        return new Double(value);
    }, "Double");
    
    function Double(value) {
        this.$value = value;
    }
    
    Double.prototype.$usesThis = true;
    Double.prototype.$class = $shed.number;
    
    Double.prototype.equals = function(other) {
        return boolean(this.$value === other.$value);
    };
    
    Double.prototype.lessThan = function(other) {
        return boolean(this.$value < other.$value);
    };
    
    Double.prototype.lessThanOrEqual = function(other) {
        return boolean(this.$value <= other.$value);
    };
    
    Double.prototype.greaterThan = function(other) {
        return boolean(this.$value > other.$value);
    };
    
    Double.prototype.subtract = function(other) {
        return number(this.$value - other.$value);
    };
    
    Double.prototype.add = function(other) {
        return number(this.$value + other.$value);
    };
    
    Double.prototype.toString = function() {
        return string(this.$value.toString());
    };
    
    Double.prototype._represent = function() {
        return string(this.$value.toString());
    };
    
    var string = $shed.string = $shed.class(function(value) {
        return new String(value);
    }, "String");
    
    function String(value) {
        this.$value = value;
    }
    
    String.prototype.$usesThis = true;
    String.prototype.$class = $shed.string;
    
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
    String.prototype.replace = function(oldString, newString) {
        // TODO: remove duplication (also in regex.js)
        function escapeRegex(string) {
            return string.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }
        
        var regex = new RegExp(escapeRegex(oldString.$value), "g");
        return string(this.$value.replace(regex, newString.$value));
    };
    String.prototype.indexOf = function(subString) {
        // TODO: fix ordering of modules
        var options = $shed.js.import("options");
        var index = this.$value.indexOf(subString.$value);
        return index === -1 ? options.none : options.some(number(index));
    };
    String.prototype.toString = function() {
        return this;
    };
    String.prototype._represent = function() {
        return string(JSON.stringify(this.$value));
    };
    
    var boolean = $shed.boolean = function(value) {
        return value;
    };
    
    function ImmutableArrayList(values) {
        this.$values = values;
    }
    
    ImmutableArrayList.prototype.$usesThis = true;
    ImmutableArrayList.prototype.$class = ImmutableArrayList;
    
    ImmutableArrayList.prototype.forEach = function(func) {
        return this.$values.forEach(func);
    };
    
    ImmutableArrayList.prototype.map = function(func) {
        return new ImmutableArrayList(this.$values.map(func));
    };
    
    ImmutableArrayList.prototype.filter = function(predicate) {
        return new ImmutableArrayList(this.$values.filter(predicate));
    };
    
    ImmutableArrayList.prototype.foldLeft = function(initialValue, func) {
        return this.$values.reduce(function(a, b) { return func(a, b); }, initialValue);
    };
    
    ImmutableArrayList.prototype.isEmpty = function() {
        return this.$values.length === 0;
    };
    
    ImmutableArrayList.prototype.length = function() {
        return number(this.$values.length);
    };
    
    ImmutableArrayList.prototype.head = function() {
        // TODO: should return an option
        return this.$values[0];
    };
    
    ImmutableArrayList.prototype.last = function() {
        // TODO: should return an option
        return this.$values[this.$values.length - 1];
    };
    
    ImmutableArrayList.prototype.append = function(value) {
        return new ImmutableArrayList(this.$values.concat([value]));
    };
    
    ImmutableArrayList.prototype.concat = function(other) {
        return new ImmutableArrayList(this.$values.concat(other.$toJsArray()));
    };
    
    ImmutableArrayList.prototype.$toJsArray = function() {
        return this.$values;
    };
    
    ImmutableArrayList.prototype.currentItem = function() {
        // HACK: should really define ImmutableArrayList later to avoid this late import
        var sequences = $shed.js.import("sequences");
        var values = this.$values;
        
        var item = function(index) {
            if (values.length === index) {
                return sequences.nil;
            } else {
                return sequences.cons(
                    values[index],
                    sequence(index + 1)
                );
            }
        };
        
        var sequence = function(index) {
            return {
                currentItem: function() {
                    return item(index);
                }
            };
        };
        
        return item(0);
    };
    
    ImmutableArrayList.prototype._represent = function() {
        var toJsString = function(value) {
            return value.$value;
        };
        var elements = this.$values.map(represent).map(toJsString).join(", ");
        return $shed.string("ImmutableArrayList([" + elements + "])");
    };
    
    ImmutableArrayList.prototype.equals = function(other) {
        var otherArray = other.$toJsArray();
        if (this.$values.length !== otherArray.length) {
            return false;
        } else {
            for (var i = 0; i < this.$values.length; i += 1) {
                if (!equal(this.$values[i], otherArray[i])) {
                    return false;
                }
            }
            return true;
        }
    };
    
    $shed.lists = {
        create: function() {
            return new ImmutableArrayList(Array.prototype.slice.call(arguments, 0));
        },
        createFromArray: function(array) {
            return new ImmutableArrayList(array);
        }
    };
    
    $shed.toJsArray = function(value) {
        if (value.$toJsArray) {
            return value.$toJsArray();
        }
        throw new Error(
            "Could not convert value to JavaScript array: " + 
                represent(value).$value
        )
    };
})();

var classOf = function(value) {
    if (value.$class) {
        return value.$class;
    } else if ($shed.isJsFunction(value)) {
        return $shed.Function;
    } else if ($isBoolean(value)) {
        return $shed.Boolean;
    } else {
        throw new Error("Could not determine class of value: " + (value.toString().$value || value.toString()));
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
    if (value._represent) {
        return value._represent();
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

var tuple = (function() {
    var Tuple = $shed.js.import("tuples.Tuple");
    
    function tuple() {
        var values = Array.prototype.slice.call(arguments, 0);
        return Tuple(values);
    }
    
    return tuple;
})();

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

var listRange = function(from, to) {
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

var range = function(from, to) {
    return {
        foldLeft: function(initialValue, func) {
            from = from.$value;
            to = to.$value;
            var result = initialValue;
            for (var i = from; i < to; i++) {
                result = func(result, i);
            }
            return result;
        }
    };
};
