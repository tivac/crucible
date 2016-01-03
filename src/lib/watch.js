"use strict";

var db = require("./firebase");

// Ensure the updated timestamp is always accurate-ish
module.exports = function(ref) {
    ref.on("child_changed", function(snap) {
        if(snap.key() === "updated") {
            return;
        }
        
        ref.child("updated").set(db.TIMESTAMP);
    });
};
