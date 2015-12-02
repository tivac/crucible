"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    set    = require("lodash.set"),

    db     = require("../lib/firebase"),
    update = require("../lib/update"),
    types  = require("./index");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;

        return m("div",
            m("p",
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
                    "Max: ",
                    m("input[type=number]", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "max")),
                        value   : details.max || ""
                    })
                )
            ),
            m.component(types.components.fields.edit, {
                details : details,
                ref     : options.ref
            })
        );
    }
};
