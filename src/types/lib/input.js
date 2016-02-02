"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    hide  = require("./hide"),
    id    = require("./id"),
    types = require("./types.css"),

    requiredRegex = /\*$/;

module.exports = function(type) {
    return {
        controller : function(options) {
            var ctrl = this;

            ctrl.id = id(options);
        },

        view : function(ctrl, options) {
            var details = options.details,
                name    = details.name,
                hidden  = hide(options);

            if(hidden) {
                return hidden;
            }

            if(details.required && !requiredRegex.test(name)) {
                name += "*";
            }

            return m("div", { class : options.class },
                m("label", {
                    for   : ctrl.id,
                    class : types[details.required ? "required" : "label"]
                }, name),
                m("input", assign({
                        // attrs
                        id       : ctrl.id,
                        type     : type || "text",
                        class    : types[type || "text"],
                        value    : options.data || "",
                        required : details.required ? "required" : null,

                        // events
                        oninput : m.withAttr("value", options.update(options.path))
                    },
                    details.attrs || {}
                ))
            );
        }
    };
};
