$shed.exportModule("promises", function() {
    function constructPromise() {
        var waiters = [];
        
        var unfulfilledImpl = {
            map: function(func) {
                var promise = createPromise();
                waiters.push(function() {
                    var result = func.apply(null, arguments);
                    promise.fulfill(result);
                });
                return promise;
            },
            bind: function(func) {
                var promise = createPromise();
                waiters.push(function() {
                    var result = func.apply(null, arguments);
                    result.map(function(value) {
                        promise.fulfill(value);
                    });
                });
                return promise;
            },
            fulfill: fulfill
        };
        
        var impl = unfulfilledImpl;
        
        function fulfill() {
            var results = arguments;
            waiters.forEach(function(waiter) {
                waiter.apply(null, results);
            });
            
            impl = {
                map: function(func) {
                    return createFulfilledPromise(func.apply(null, results));
                },
                bind: function(func) {
                    return func.apply(null, results);
                }
            };
        }
        
        return {
            $class: Promise,
            map: function(func) {
                return impl.map(func);
            },
            bind: function(func) {
                return impl.bind(func);
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
        if (promises.length().$value === 0) {
            return createFulfilledPromise(emptyList);
        }
        
        var combinedPromise = createPromise();
        var values = [];
        
        var numberOfFulfilledPromises = 0;
        promises.forEach(function(promise, index) {
            promise.map(function(value) {
                numberOfFulfilledPromises += 1;
                values[index] = value;
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
