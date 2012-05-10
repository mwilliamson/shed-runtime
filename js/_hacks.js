$shed.exportModule("_hacks", function() {
    return {
        isSame: function(first, second) {
            return first === second;
        }
    };
});
