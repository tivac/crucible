"use strict";

var db = require("./firebase");

function Entry(opts) {
    this.type = opts.type;
    this.id   = opts.id;
    this.rev  = opts.version;
    
    this.ref = this.rev ?
        db.child("versions").child(this.id) :
        db.child("content").child(this.type).child(this.id);
}

Entry.prototype = {
    version : function(done) {
        var ref = this.ref;
        
        ref.once("value", function(snap) {
            var data = snap.exportVal(),
                rev  = data.version || 1;

            db.child("versions").child(snap.key()).child(rev).set(data);

            ref.child("version").set(++rev);
            
            typeof done === "function" && done(null, rev);
        });
    },
    
    remove : function(done) {
        var ref = this.ref;
        
        // Save off a revision and then remove        
        this.version(function() {
            ref.remove(done);
        });s
    },
    
    restore : function(version, done) {
        var ref     = this.ref,
            history = db.child("versions").child(this.id);
        
        // Save current revision off
        this.version(function(error, rev) {
            
            // Then go grab historical revision and make it the thing
            history.child(version).once("value", function(snap) {
                var out = snap.exportVal();

                out.version = rev;

                ref.set(out, done);
            });
        });
    }
};

module.exports = Entry;
