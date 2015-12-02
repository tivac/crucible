"use strict";

var m      = require("mithril"),

    db     = require("../lib/firebase"),
    update = require("../lib/update"),
    fields = require("./");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.addoption = function(e) {
            e.preventDefault();
            
            ref.child("options").once("value", function(snap) {
                var id = "option-" + snap.numChildren();

                snap.ref().child(id).setWithPriority({
                    name  : "Option"
                }, snap.numChildren());
            });
        };
    },

    view : function(ctrl, options) {
        var details = options.details;

        return m("ul",
            m("li",
                m("label",
                    "Name: ",
                    m("input", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "name")),
                        value   : details.name || "",
                        config  : function(el, init) {
                            if(init) {
                                return;
                            }
                            
                            el.select();
                        }
                    })
                )
            ),
            m("li",
                m("label",
                    "Size: ",
                    m("input[type=number][min=1][max=100][step=1]", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "attrs/size")),
                        value   : details.attrs.size
                    })
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", update.bind(null, options.ref, "attrs/disabled")),
                        checked : details.attrs.disabled || false
                    }),
                    " Disabled"
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", update.bind(null, options.ref, "attrs/readonly")),
                        checked : details.attrs.readonly || false
                    }),
                    " Read-Only"
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", update.bind(null, options.ref, "attrs/multiple")),
                        checked : details.attrs.multiple || false
                    }),
                    " Multiple selection allowed"
                )
            ),
            m("hr"),
            m("ul",
                Object.keys(details.options || {}).map(function(key) {
                    return m("li",
                        m.component(fields.components.option.edit, {
                            details : details.options[key],
                            ref     : options.ref.child("options/" + key)
                        })
                    );
                })
            ),
            m("button", { onclick : ctrl.addoption }, "Add Option")
        );
    }
};
