$shed.exportModule("lazySequences", function() {
    var sequences = $shed.js.import("sequences");
    var map = function(F, T) {
        return function(func, sequence) {
            if (sequence === sequences.nil) {
                return sequence;
            } else {
                return {
                    head: function() {
                        return func(sequence.head());
                    },
                    tail: function() {
                        return map(F, T)(func, sequence.tail());
                    }
                };
            }
        };
    };
    var concat = function(T) {
        return function(sequenceOfSequences) {
            if (sequenceOfSequences === sequences.nil) {
                return sequences.nil;
            } else {
                var headSequence = sequenceOfSequences.head();
                if (headSequence === sequences.nil) {
                    return concat(T)(sequenceOfSequences.tail());
                } else {
                    return {
                        head: function() {
                            return headSequence.head();
                        },
                        tail: function() {
                            return concat(sequence.cons(
                                headSequence.tail(),
                                sequenceOfSequences.tail()
                            ));
                        }
                    };
                }
            }
        };
    };
    return {
        map: map,
        concat: concat
    };
});
