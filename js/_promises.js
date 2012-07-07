$shed.exportModule("_promises", function() {
    function createPromise() {
        var waitingMaps = [];
        
        var unfulfilledImpl = {
            map: function(func) {
                waitingMaps.push(func);
                // TODO: return another promise
            },
            fulfill: fulfill
        };
        
        var impl = unfulfilledImpl;
        
        function fulfill(result) {
            // TODO: replace impl so that calls that come in after fulfillment
            // work
            waitingMaps.forEach(function(waitingMap) {
                waitingMap(result);
            });
        }
        
        return {
            map: function(func) {
                return impl.map(func);
            },
            fulfill: function() {
                return fulfill.apply(this, arguments);
            }
        };
    }
    
    return {
        createPromise: createPromise
    };
});
