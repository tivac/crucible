"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    slug   = require("unique-slug"),

    update = require("../lib/update"),
    types  = require("./types.css"),
    css    = require("./textarea.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;
    
        ctrl.id   = slug(options.details.name);
        ctrl.text = options.data || "";

        ctrl.resize = function(value, e) {
            var lines;

            if(options.ref) {
                update(options.ref, null, value);
            }

            ctrl.text = value;
        };
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
            m("div", { class : css.expander },
                m("pre", { class : css.shadow }, m("span", ctrl.text), m("br")),
                m("textarea", assign({
                        // attrs
                        id       : ctrl.id,
                        class    : css.textarea,
                        required : details.required ? "required" : null,

                        // events
                        oninput : m.withAttr("value", ctrl.resize)
                    },
                    details.attrs || {}
                ), options.data || "")
            )
        );
    }
};
