$shed.exportModule("lazySequenceables", function() {
    var lazySequences = $shed.js.import("lazySequences");
    
    var sequenceToSequenceable = function(sequence) {
        return {
            toSequence: function() {
                return sequence;
            }
        };
    };
    
    var map = function(F, T) {
        return function(func, sequenceable) {
            var sequence = lazySequences.map(F, T)(func, sequenceable.toSequence());
            return sequenceToSequenceable(sequence);
        };
    };
    var concat = function(T) {
        return function(sequenceableOfSequenceables) {
            var toSequence = function(sequenceable) {
                return sequenceable.toSequence();
            };
            // TODO: should be map(Sequenceable(T), Sequence(T))
            var sequenceOfSequences = toSequence(map(null, null)(toSequence, sequenceableOfSequenceables));
            var sequence = lazySequences.concat(T)(sequenceOfSequences);
            return sequenceToSequenceable(sequence);
        };
    };
    return {
        map: map,
        concat: concat
    };
});
