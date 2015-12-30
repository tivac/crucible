"use strict";

var m  = require("mithril"),
    
    db = require("../../lib/firebase"),
    
    css = require("./versioning.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.snapshot = function(e) {
            options.ref.once("value", function(snap) {
                var data = snap.exportVal(),
                    rev  = data._revision || 1,
                    dest = db.child("versions").child(snap.key()).child(rev);

                dest.set(data);

                options.ref.child("_version").set(rev + 1);
            });
        };
    },

    view : function(ctrl, options) {
        return m("div", { class : options.class },
            m("span",
                "Current Version: " + (options.data._version || 1)
            ),
            m("button", {
                class   : css.save,
                onclick : ctrl.snapshot
            }, "Save new Version")
        );
    }
};
