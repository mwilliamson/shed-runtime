$shed.exportModule("files", function() {
    var fs = require("fs");
    var path = require("path");
    var promises = $shed.js.import("promises");
    
    function readFile(filePath, encoding) {
        var promise = promises.createPromise();
        
        fs.readFile(filePath.$value, encoding.$value, function(err, contents) {
            promise.fulfill($shed.string(contents));
        });
        
        return promise;
    }
    
    function finder() {
        return new Finder({
            filters: []
        });
    }
    
    function Finder(options) {
        this.$options = options;
    }
    
    Finder.prototype.filesOnly = function() {
        return this;
    };
    
    Finder.prototype.directory = function(directory) {
        return new Finder({
            directory: directory,
            filters: this.$options.filters
        });
    };
    
    Finder.prototype.filterFiles = function() {
        return new FinderFileFilter(this);
    };
    
    Finder.prototype.find = function() {
        var filters = this.$options.filters;
        var promise = promises.createPromise();
        
        var result = [];
        var unexpanded = [this.$options.directory.$value];
        
        function next() {
            if (unexpanded.length === 0) {
                promise.fulfill($lists.createFromArray(result.map($shed.string)));
            } else {
                expandNext();
            }
        }
        
        // TODO: handle err
        
        function expandNext() {
            var filePath = unexpanded.pop();
            fs.stat(filePath, function(err, stats) {
                if (stats.isFile() && matchesAllFilters(filePath)) {
                    result.push(filePath);
                    next();
                } else if (stats.isDirectory()) {
                    fs.readdir(filePath, function(err, files) {
                        files.forEach(function(file) {
                            unexpanded.push(path.join(filePath, file));
                        });
                        next();
                    });
                } else {
                    next();
                }
            });
        }
        
        function matchesAllFilters(path) {
            return filters.every(function(filter) {
                return filter(path);
            });
        }
        
        next();
        
        return promise;
    };
    
    function FinderFileFilter(finder) {
        this.$finder = finder;
    }
    
    FinderFileFilter.prototype.hasExtension = function(extension) {
        var filters = this.$finder.$options.filters.slice(0);
        filters.push(function(file) {
            return new RegExp("" + extension.$value + "$").test(file);
        });
        return new Finder({
            directory: this.$finder.$options.directory,
            filters: filters
        });
    };
    
    return {
        readFile: readFile,
        finder: finder
    };
});
