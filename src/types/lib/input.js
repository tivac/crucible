"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    hide  = require("./hide"),
    id    = require("./id"),
    label = require("./label"),
    
    css = require("./types.css");

module.exports = function(type) {
    return {
        controller : function(options) {
            var ctrl = this;

            ctrl.id = id(options);
        },

        view : function(ctrl, options) {
            var field = options.details,
                hidden  = hide(options);

            if(hidden) {
                return hidden;
            }

            return m("div", { class : options.class },
                label(ctrl, options),
                m("input", assign({
                        // attrs
                        id       : ctrl.id,
                        type     : type || "text",
                        class    : css[type || "text"],
                        value    : options.data || "",
                        required : field.required ? "required" : null,

                        // events
                        oninput : m.withAttr("value", options.update(options.path))
                    },
                    field.attrs || {}
                ))
            );
        }
    };
};
