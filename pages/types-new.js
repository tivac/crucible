"use strict";

var m = require("mithril"),
    Firebase = require("firebase"),

    fields = require("../fields"),
    
    db = new Firebase("https://blazing-torch-6027.firebaseio.com/types");

module.exports = {
    controller : function() {
        var ctrl = this;

        ctrl.name = m.prop("");

        ctrl.onsubmit = function(e) {
            var id;

            e.preventDefault();

            id = db.push({
                name   : ctrl.name(),
                fields : {}
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
