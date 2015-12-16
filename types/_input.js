"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    slug   = require("unique-slug"),

    update = require("../lib/update"),
    types  = require("./types.css");

module.exports = function(type) {
    return {
        controller : function(options) {
            var ctrl = this;
        
            ctrl.id = slug(options.details.name);
        },

        view : function(ctrl, options) {
            var details = options.details,
                name    = details.name;
            
            if(details.required) {
                name += "*";
            }

            return m("div", { class : options.class },
                m("label", {
                    for   : ctrl.id,
                    class : types[details.required ? "required" : "label"]
                }, name),
                m("input", assign({
                        id      : ctrl.id,
                        type    : type || "text",
                        value   : options.data || "",
                        class   : types.input,
                        oninput : options.ref && m.withAttr("value", update.bind(null, options.ref, null))
                    },
                    details.attrs || {}
                ))
            );
        }
    }
};
