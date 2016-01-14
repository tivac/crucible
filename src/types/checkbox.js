"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    id     = require("../lib/id"),
    update = require("../lib/update"),
    types  = require("./types.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.id      = id(options);
        ctrl.checked = options.data === true;

        ctrl.onclick = function(options, checked) {
            if(options.ref) {
                update(options.ref, null, checked);
            }

            ctrl.checked = checked;
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
            m("div", { class : types.checkbox },
                m("input", assign({
                        // attrs
                        id       : ctrl.id,
                        type     : "checkbox",
                        checked  : ctrl.checked,
                        required : details.required ? "required" : null,

                        // events
                        onclick : m.withAttr("checked", ctrl.onclick.bind(ctrl, options))
                    },
                    details.attrs || {}
                ), options.data || "")
            )
        );
    }
};
