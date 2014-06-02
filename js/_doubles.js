$shed.exportModule("_doubles", function() {
    var number = $shed.number = $shed.class(function(value) {
        return new Double(value);
    }, "Double");
    
    function Double(value) {
        this.$value = value;
    }
    
    Double.prototype.$usesThis = true;
    Double.prototype.$class = $shed.number;
    
    Double.prototype.equals = function(other) {
        return $shed.boolean(this.$value === other.$value);
    };
    
    Double.prototype.lessThan = function(other) {
        return $shed.boolean(this.$value < other.$value);
    };
    
    Double.prototype.lessThanOrEqual = function(other) {
        return $shed.boolean(this.$value <= other.$value);
    };
    
    Double.prototype.greaterThan = function(other) {
        return $shed.boolean(this.$value > other.$value);
    };
    
    Double.prototype.subtract = function(other) {
        return $shed.number(this.$value - other.$value);
    };
    
    Double.prototype.add = function(other) {
        return $shed.number(this.$value + other.$value);
    };
    
    Double.prototype.toString = function() {
        return $shed.string(this.$value.toString());
    };
    
    Double.prototype._represent = function() {
        return $shed.string(this.$value.toString());
    };
    
    return {
        number: number
    };
});
