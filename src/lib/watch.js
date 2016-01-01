"use strict";

// Ensure the updated timestamp is always accurate-ish
module.exports = function(ref) {
    ref.on("child_changed", function(snap) {
        if(snap.key() === "_updated") {
            return;
        }
        
        ref.child("_updated").set(db.TIMESTAMP);
    });
};
