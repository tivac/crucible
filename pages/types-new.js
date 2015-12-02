"use strict";

var m = require("mithril"),

    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl  = this,
            ref   = db.child("schemas");

        ctrl.name = m.prop("");

        ctrl.onsubmit = function(e) {
            var result;

            e.preventDefault();

            result = ref.push({
                name    : ctrl.name(),
                created : db.TIMESTAMP,
                updated : db.TIMESTAMP
            });

            m.route("/types/" + result.key());
        };
    },

    view : function(ctrl) {
        return [
            m("h1", "Add a Type"),
            m("form", { onsubmit : ctrl.onsubmit },
                m("input[name=name]", { oninput : m.withAttr("value", ctrl.name), value : ctrl.name() }),
                m("input[type=submit]", { value : "Add" })
            )
        ];
    }
};
