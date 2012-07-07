$shed.exportModule("time", function() {
    var _promises = $shed.js.import("_promises");
    return {
        sleep: function(seconds) {
            var promise = _promises.createPromise();
            
            setTimeout(function() {
                promise.fulfill();
            }, seconds.$value * 1000);
            
            return promise;
        }
    };
});
