"use strict";

var m = require("mithril"),

    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl  = this,
            types = db.child("types");

        ctrl.name = m.prop("");

        ctrl.onsubmit = function(e) {
            var id;

            e.preventDefault();

            id = types.push({
                name : ctrl.name()
            });

            m.route("/types/" + id.key());
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
