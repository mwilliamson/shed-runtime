$shed.exportModule("nodejs", function() {
    var util = require("util");
    var child_process = require("child_process");
    var _promises = $shed.js.import("_promises");
    
    var command = util.format("node");
    
    function executeString(javaScript) {
        var promise = _promises.createPromise();
        
        var child = child_process.exec("node", {env: {}}, function(err, stdout, stderr) {
            promise.fulfill(createExecutionResult(err, stdout, stderr));
        });
        
        child.stdin.write(javaScript.$value);
        child.stdin.end();
        
        return promise;
    }
    
    function createExecutionResult(err, stdout, stderr) {
        return {
            stdout: function() {
                return $shed.string(stdout);
            }
        };
    }
    
    return {
        executeString: executeString
    };
});
