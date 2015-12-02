"use strict";

var m = require("mithril"),
    
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
                    "Body: ",
                    m("textarea", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "body"))
                    }, details.body || "")
                )
            )
        );
    }
};
