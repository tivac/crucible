"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    update = require("../lib/update"),
    types  = require("./types.css");

module.exports = function(type) {
    return {
        view : function(ctrl, options) {
            var details = options.details;
            
            return m("div", { class : types[options.index ? "field" : "first"] },
                m("label", { class : types.label }, details.name,
                    m("input", assign({
                            type    : type || "text",
                            value   : options.data || "",
                            class   : types.input,
                            oninput : options.ref && m.withAttr("value", update.bind(null, options.ref, null))
                        },
                        details.attrs || {}
                    ))
                )
            );
        }
    }
};
