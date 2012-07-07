$shed.exportModule("nodejs", function() {
    var util = require("util");
    var child_process = require("child_process");
    var path = require("path");
    
    var command = util.format("node");
    
    function executeString(javaScript) {
        var child = child_process.exec("node", {env: {}}, function(err, stdout, stderr) {
            fulfill(createExecutionResult(err, stdout, stderr));
        });
        
        child.stdin.write(javaScript.$value);
        child.stdin.end();
        
        var waitingMaps = [];
        
        var unfulfilledImpl = {
            map: function(func) {
                waitingMaps.push(func);
            }
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
            }
        };
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
