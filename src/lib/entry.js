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
    version : function() {
        var ref = this.ref;
        
        return db.value(ref, "once").then(function(snap) {
            var data = snap.exportVal(),
                rev  = data.version || 1;
            
            return Promise.all([
                db.set(db.child("versions").child(snap.key()).child(rev), data),
                db.set(ref.child("version"), ++rev)
            ]);
        });
    },
    
    remove : function() {
        var ref = this.ref;
        
        // Save off a revision first
        return this.version().then(function() {
            
            // And then remove
            return db.remove(ref);
        });
    },
    
    restore : function(version) {
        var ref     = this.ref,
            history = db.child("versions").child(this.id).child(version);
        
        // Save current data
        return this.version().then(function() {
            return db.value(history, "once");
        }).then(function(snap) {
            var out = snap.exportVal();

            out.version = rev;

            return db.set(ref, out);
        });
    }
};

module.exports = Entry;
