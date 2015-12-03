"use strict";

var m      = require("mithril"),

    db     = require("../lib/firebase"),
    update = require("../lib/update");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.selected = function(ref, path, value) {
            // Update the current option first
            update(ref, path, value);

            // Iterate all the children of the parent and negate everyone else
            ref.parent().once("value", function(snap) {
                snap.forEach(function(option) {
                    if(option.key() === ref.key()) {
                        return;
                    }


                    update(option.ref(), path, false);
                });
            });
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
            key     = options.ref.key();

        if(!details.attrs) {
            details.attrs = {};
        }

        return m("ul",
            m("li",
                m("label",
                    "Name: ",
                    m("input", {
                        value   : details.name || "",
                        oninput : m.withAttr("value", update.bind(null, options.ref, "name"))
                    })
                )
            ),
            m("li",
                m("label",
                    "Value: ",
                    m("input", {
                        value   : details.attrs.value || "",
                        oninput : m.withAttr("value", update.bind(null, options.ref, "attrs/value"))
                    })
                )
            ),
            m("li",
                m("label",
                    m("input[type=radio]", {
                        name    : key + "-selected",
                        checked : details.selected || false,
                        onclick : m.withAttr("checked", ctrl.selected.bind(null, options.ref, "selected"))
                    }),
                    " Default selection?"
                )
            )
        );
    }
};
