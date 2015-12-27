"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    slug   = require("sluggo"),

    update  = require("../lib/update"),
    upgrade = require("../lib/mdl-upgrade"),
    types   = require("./types.css");

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

            return m(".mdl-textfield.mdl-js-textfield.mdl-textfield--floating-label", { class : options.class, config : upgrade },
                m("input.mdl-textfield__input", assign({
                        // attrs
                        id       : ctrl.id,
                        type     : type || "text",
                        value    : options.data || "",
                        class    : types.input,
                        required : details.required ? "required" : null,

                        // events
                        oninput : options.ref && m.withAttr("value", update.bind(null, options.ref, null))
                    },
                    details.attrs || {}
                )),
                m("label.mdl-textfield__label", {
                    for   : ctrl.id,
                    class : types[details.required ? "required" : "label"]
                }, name),
                m("span.mdl-textfield__error", "Input is incorrect!")
            );
        }
    }
};
