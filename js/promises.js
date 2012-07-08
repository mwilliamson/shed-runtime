$shed.exportModule("promises", function() {
    function constructPromise() {
        var waitingMaps = [];
        
        var unfulfilledImpl = {
            map: function(func) {
                var promise = createPromise();
                waitingMaps.push(function() {
                    var result = func.apply(null, arguments);
                    promise.fulfill(result);
                });
                return promise;
            },
            fulfill: fulfill
        };
        
        var impl = unfulfilledImpl;
        
        function fulfill() {
            var results = arguments;
            waitingMaps.forEach(function(waitingMap) {
                waitingMap.apply(null, results);
            });
            
            impl = {
                map: function(func) {
                    return createFulfilledPromise(func.apply(null, results));
                }
            };
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
    
    var Promise = $shed.class(constructPromise, "Promise");
    var createPromise = Promise;
    function createFulfilledPromise() {
        var promise = createPromise();
        promise.fulfill.apply(promise, arguments);
        return promise;
    }
    
    function combineList(promises) {
        var combinedPromise = createPromise();
        var values = [];
        
        var numberOfFulfilledPromises = 0;
        promises.forEach(function(promise) {
            promise.map(function(value) {
                numberOfFulfilledPromises += 1;
                values.push(value);
                if (numberOfFulfilledPromises === promises.length().$value) {
                    combinedPromise.fulfill($shed.lists.createFromArray(values));
                }
            });
        });
        
        return combinedPromise;
    }
    
    return {
        createPromise: createPromise,
        createFulfilledPromise: createFulfilledPromise,
        isPromise: function(value) {
            return value.$class === Promise;
        },
        combineList: combineList
    };
});
