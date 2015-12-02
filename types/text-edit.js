"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db     = require("../lib/firebase"),
    update = require("../lib/update");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        if(!details.attrs) {
            details.attrs = {};
        }

        return m("ul",
            m("li",
                m("label",
                    "Name: ",
                    m("input", {
                        value   : details.name || "",
                        oninput : m.withAttr("value", update.bind(null, options.ref, "name")),
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
