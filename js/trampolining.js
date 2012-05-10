$shed.exportModule("trampolining", function() {
    var options = $shed.js.import("options");
    var trampoline = function(func) {
        var next = nextFunction(func);
        
        while (next.$isTrampolineNextFunction) {
            next = next.func();
        }
        
        return next.value;
    };
    
    var nextFunction = function(func) {
        return {
            $isTrampolineNextFunction: true,
            func: func
        };
    };
    
    var stop = function(value) {
        return {
            value: value
        };
    };
    
    return {
        trampoline: trampoline,
        nextFunction: nextFunction,
        stop: stop
    };
});
