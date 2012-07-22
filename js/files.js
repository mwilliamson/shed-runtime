$shed.exportModule("files", function() {
    var fs = require("fs");
    var promises = $shed.js.import("promises");
    
    function readFile(filePath, encoding) {
        var promise = promises.createPromise();
        
        fs.readFile(filePath.$value, encoding.$value, function(err, contents) {
            promise.fulfill($shed.string(contents));
        });
        
        return promise;
    }
    
    return {
        readFile: readFile
    };
});
