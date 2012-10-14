$shed.exportModule("console", function() {
    var stderr = {
        write: function(string) {
            process.stderr.write(string.$value);
        }
    };
    
    return {
        stderr: stderr
    };
});
