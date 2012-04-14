$shed.exportModule("_sequences", function() {
    var nil = {};
    var cons = function(T) {
        return function(head, tail) {
            return {
                head: function() {
                    return head;
                },
                tail: function() {
                    return tail;
                }
            };
        };
    };
    return {
        nil: nil,
        cons: cons
    };
});
