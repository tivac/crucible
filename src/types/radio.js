"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    id = require("../lib/id"),

    types = require("./types.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.id = id(options);

        ctrl.onclick = function(options, value) {
            if(options.ref) {
                options.ref.set(value);
            }
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
            value   = options.data,
            name    = details.name,
            match;

        if(details.required) {
            name += "*";
        }

        // Work out which input, if any, should be checked
        if(value) {
            match = details.children.find(function(opt) {
                return opt.value.toString() === value;
            });

            if(match) {
                details.children.forEach(function(opt) {
                    opt.checked = false;
                });

                match.checked = true;
            }
        }

        return m("div", { class : options.class },
            m("label", {
                class : types[details.required ? "required" : "label"]
            }, name),
            details.children.map(function(opt, i) {
                var id = details.slug + "-" + i;

                return [
                    m("label", { for : id }, opt.name),
                    m("input", {
                        // attrs
                        id      : id,
                        type    : "radio",
                        name    : name,
                        value   : opt.value,
                        checked : opt.checked,

                        // events
                        onclick : m.withAttr("value", ctrl.onclick.bind(ctrl, options))
                    })
                ];
            })
        );
    }
};
