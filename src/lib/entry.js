"use strict";

var moment = require("moment"),

    db      = require("./firebase"),
    watch   = require("./watch"),
    watches = {};

function Entry(opts) {
    this.schema = opts.schema;
    this.id     = opts.id;
    this.rev    = opts.version;
    
    this.ref = this.rev ?
        db.child("versions").child(this.id) :
        db.child("content").child(this.schema).child(this.id);
    
}

Entry.prototype = {
    data : function(done) {
        this.ref.on("value", done);
    },
    
    publish : function(date) {
        return db.set(this.ref.child("published"), date || moment().subtract(10, "seconds").valueOf());
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
    },
    
    set : function(path, val) {
        // Start watching (if this isn't already being watched...)
        if(!watches[this.id]) {
            watches[this.id] = watch(this.ref);
        }
        
        return set(this.ref.child(path.join("/")), val);
    },
    
    unpublish : function() {
        return db.remove(this.ref.child("published"));
    },
    
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
    }
};

module.exports = Entry;
