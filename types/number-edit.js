"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    update = require("../lib/update");

module.exports = {
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
                    "Placeholder: ",
                    m("input", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "attrs/placeholder")),
                        value   : details.attrs.placeholder || ""
                    })
                )
            ),
            m("li",
                m("label",
                    "Min: ",
                    m("input[type=number]", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "attrs/min")),
                        value   : details.attrs.min || ""
                    })
                )
            ),
            m("li",
                m("label",
                    "Max: ",
                    m("input[type=number]", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "attrs/max")),
                        value   : details.attrs.max || ""
                    })
                )
            ),
            m("li",
                m("label",
                    "Step: ",
                    m("input[type=number]", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "attrs/step")),
                        value   : details.attrs.step || ""
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
            )
        );
    }
};
