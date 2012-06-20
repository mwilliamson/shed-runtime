$shed.exportModule("tuples", function() {
    return {
        head: function(tuple) {
            return tuple.$values[0];
        },
        $createFromArray: function(array) {
            return tuple.apply(this, array);
        }
    };
});
