global.$shed = global.$shed || {};
$shed.modules = $shed.modules || {};

var dummyType = {
    $isShedType: true
};

(function() {
    var modules = {
    };
    
    $shed.unit = {};
    
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
            slice: function(index) {
                return string(value.slice(index.$value));
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
    
    $shed.js = {
        import: function(name) {
            return $shed.import($shed.string(name));
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

$shed.exportModule("_sequences", function() {
    var nil = {};
    var cons = function(T) {
        return function(head, tail) {
            return {
                head: function() {
                    return head;
                },
                tail: function() {
                    return tail;
                }
            };
        };
    };
    return {
        nil: nil,
        cons: cons
    };
});

$shed.exportModule("sequences", function() {    
    var _sequences = $shed.js.import("_sequences");
    var options = $shed.js.import("options");
    var nil = _sequences.nil;
    
    var head = function(T) {
        return function(sequence) {
            if (sequence === nil) {
                return options.none;
            } else {
                return options.some(T)(sequence.head());
            }
        };
    };
    
    var lazyCons = function(T) {
        return function(head, deferredTail) {
            return {
                head: function() {
                    return head;
                },
                tail: deferredTail
            };
        };
    };
    
    var forEachTrampolined = function(T) {
        return function(sequence, func) {
            if (sequence === nil) {
                return null;
            } else {
                func(sequence.head());
                return function() {
                    return forEachTrampolined(T)(sequence.tail(), func);
                };
            }
        };
    };
    var forEach = function(T) {
        return function(sequence, func) {
            var next = function() {
                return forEachTrampolined(T)(sequence, func);
            };
            while (next !== null) {
                next = next();
            }
        };
    };
    var singleton = function(T) {
        return function(value) {
            return _sequences.cons(T)(value, _sequences.nil);
        };
    };
        
    return {
        forEach: forEach,
        nil: nil,
        head: head,
        lazyCons: lazyCons,
        singleton: singleton
    };
});

$shed.exportModule("sequenceables", function() {
    var sequences = $shed.js.import("sequences");
    var head = function(T) {
        return function(sequenceable) {
            return sequences.head(T)(sequenceable.toSequence());
        };
    };
    return {
        head: head
    };
});

$shed.exportModule("lazySequences", function() {
    var sequences = $shed.js.import("sequences");
    var map = function(F, T) {
        return function(func, sequence) {
            if (sequence === sequences.nil) {
                return sequence;
            } else {
                return {
                    head: function() {
                        return func(sequence.head());
                    },
                    tail: function() {
                        return map(F, T)(func, sequence.tail());
                    }
                };
            }
        };
    };
    var concat = function(T) {
        return function(sequenceOfSequences) {
            if (sequenceOfSequences === sequences.nil) {
                return sequences.nil;
            } else {
                var headSequence = sequenceOfSequences.head();
                if (headSequence === sequences.nil) {
                    return concat(T)(sequenceOfSequences.tail());
                } else {
                    return {
                        head: function() {
                            return headSequence.head();
                        },
                        tail: function() {
                            return concat(sequence.cons(
                                headSequence.tail(),
                                sequenceOfSequences.tail()
                            ));
                        }
                    };
                }
            }
        };
    };
    return {
        map: map,
        concat: concat
    };
});

$shed.exportModule("lazySequenceables", function() {
    var lazySequences = $shed.js.import("lazySequences");
    
    var sequenceToSequenceable = function(sequence) {
        return {
            toSequence: function() {
                return sequence;
            }
        };
    };
    
    var map = function(F, T) {
        return function(func, sequenceable) {
            var sequence = lazySequences.map(F, T)(func, sequenceable.toSequence());
            return sequenceToSequenceable(sequence);
        };
    };
    var concat = function(T) {
        return function(sequenceableOfSequenceables) {
            var toSequence = function(sequenceable) {
                return sequenceable.toSequence();
            };
            // TODO: should be map(Sequenceable(T), Sequence(T))
            var sequenceOfSequences = toSequence(map(null, null)(toSequence, sequenceableOfSequenceables));
            var sequence = lazySequences.concat(T)(sequenceOfSequences);
            return sequenceToSequenceable(sequence);
        };
    };
    return {
        map: map,
        concat: concat
    };
});

$shed.exportModule("lists", function() {
    var options = $shed.js.import("options");
    var sequences = $shed.js.import("sequences");
    var sequenceToList = function(T) {
        return function(sequence) {
            var result = [];
            sequences.forEach(T)(sequence, function(value) {
                result.push(value);
            });
            return $shed.lists.createFromArray(T)(result);
        };
    };
    return {
        sequenceToList: sequenceToList
    };
});
