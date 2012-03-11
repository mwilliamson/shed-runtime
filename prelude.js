var print = function(value) {
    process.stdout.write(value);
};

var $number = function(value) {
    return {
        $value: value,
        equals: function(other) {
            return value === other.$value;
        },
        subtract: function(other) {
            return $number(value - other.$value);
        },
        add: function(other) {
            return $number(value + other.$value);
        },
        toString: function() {
            return value.toString();
        }
    };
};
