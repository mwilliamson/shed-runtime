$shed.exportModule("tuples", function() {
    var Tuple = $shed.class(function(values) {
        return new $tupleConstructor(values);
    }, "Tuple");
    
    function $tupleConstructor(values) {
        this.$values = values;
    }

    $tupleConstructor.prototype.$class = Tuple;
    $tupleConstructor.prototype.$usesThis = true;

    $tupleConstructor.prototype.equals = function(other) {
        if (classOf(other) !== Tuple) {
            return false;
        }
        if (this.$values.length !== other.$values.length) {
            return false;
        }
        for (var i = 0; i < this.$values.length; i += 1) {
            if (!equal(this.$values[i], other.$values[i])) {
                return false;
            }
        }
        return true;
    };

    $tupleConstructor.prototype._represent = function() {
        var valuesString = this.$values.map(function(value) {
            return represent(value).$value;
        }).join(", ");
        return $shed.string(
            "tuple(".concat(valuesString).concat(")")
        );
    };

    $tupleConstructor.prototype.append = function(value) {
        var newValues = this.$values.slice(0);
        newValues.push(value);
        return tuple.apply(this, newValues);
    };

    $tupleConstructor.prototype.appendDestructive = function(value) {
        this.$values.push(value);
        return this;
    };

    $tupleConstructor.prototype.map = function(func) {
        return func.apply(null, this.$values);
    };

    return {
        head: function(tuple) {
            return tuple.$values[0];
        },
        $createFromArray: function(array) {
            return tuple.apply(this, array);
        },
        Tuple: Tuple
    };
});
