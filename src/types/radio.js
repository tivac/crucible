"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    id    = require("./lib/id"),
    hide  = require("./lib/hide"),
    types = require("./lib/types.css"),
    
    css = require("./radio.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.id = id(options);

        // Work out which input, if any, should be checked
        ctrl.checked = function(details, value) {
            var match;

            if(!value) {
                return;
            }

            match = details.children.find(function(opt) {
                return opt.value.toString() === value;
            });

            if(match) {
                details.children = details.children.map(function(opt) {
                    opt.checked = (opt === match);

                    return opt;
                });
            }
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
            name    = details.name,
            hidden  = hide(options),
            match;
        
        if(hidden) {
            return hidden;
        }

        if(details.required) {
            name += "*";
        }
        
        ctrl.checked(details, options.data);

        return m("div", { class : options.class },
            m("label", {
                class : types[details.required ? "required" : "label"]
            }, name),
            details.children.map(function(opt, i) {
                var id = ctrl.id + "-" + i;

                return [
                    m("label", { class : css.choice },
                        m("input", {
                            // attrs
                            type    : "radio",
                            name    : name,
                            value   : opt.value,
                            checked : opt.checked,

                            // events
                            onclick : m.withAttr("value", options.update(options.path))
                        }),
                        " " + opt.name
                    )
                ];
            })
        );
    }
};
