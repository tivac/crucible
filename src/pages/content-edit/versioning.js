"use strict";

var m  = require("mithril"),

    db = require("../../lib/firebase"),

    css = require("./versioning.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.schema = m.route.param("schema");
        ctrl.id     = m.route.param("id");

        ctrl.snapshot = function() {
            options.ref.once("value", function(snap) {
                var data = snap.exportVal(),
                    rev  = data.version || 1,
                    dest = db.child("versions").child(snap.key()).child(rev);

                dest.set(data);

                options.ref.child("version").set(rev + 1);
            });
        };
    },

    view : function(ctrl, options) {
        return m("div", { class : options.class },
            m("div", { class : css.verHist },
                m(".pure-u",
                    m("div",
                        "Version: " + (options.data.version || 1)
                    ),
                    m("a", {
                        href : "/content/" + ctrl.schema + "/" + ctrl.id + "/history"
                    }, "History")
                ),
                m(".pure-u",
                    m("button", {
                        class   : css.save,
                        onclick : ctrl.snapshot
                    }, "Save")
                )
            )
        );
    }
};
