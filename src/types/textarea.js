"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    id    = require("./lib/id"),
    hide  = require("./lib/hide"),
    types = require("./lib/types.css"),

    css = require("./textarea.css"),

    requiredRegex = /\*$/;

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.id   = id(options);
        ctrl.text = options.data || "";

        ctrl.resize = function(opt, value) {
            opt.update(opt.path, value);

            ctrl.text = value;
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
            name    = details.name,
            hidden  = hide(options);

        if(hidden) {
            return hidden;
        }

        if(details.required && !/\*$/.test(name)) {
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
                        oninput : m.withAttr("value", ctrl.resize.bind(null, options))
                    },
                    details.attrs || {}
                ), options.data || "")
            )
        );
    }
};
