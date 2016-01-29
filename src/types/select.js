"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    id    = require("./lib/id"),
    hide  = require("./lib/hide"),
    types = require("./lib/types.css");

function optvalue(option) {
    return option.value || option.name;
}

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.id = id(options);

        ctrl.onchange = function(options, index) {
            var opt = options.details.children[index];
            
            options.update(options.path, optvalue(opt));
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
            value   = options.data,
            name    = details.name,
            hidden  = hide(options);

        if(hidden) {
            return hidden;
        }

        if(details.required) {
            name += "*";
        }

        // Need to go see if one of the options should be already selected
        if(!value) {
            details.children.some(function(opt) {
                if(opt.selected) {
                    value = optvalue(opt);
                }

                return value;
            });
        }

        return m("div", { class : options.class },
            m("label", {
                for   : ctrl.id,
                class : types[details.required ? "required" : "label"]
            }, name),
            m("select", assign({
                    // attrs
                    value    : value,
                    class    : types.select,
                    required : details.required ? "required" : null,

                    // events
                    onchange : m.withAttr("selectedIndex", ctrl.onchange.bind(null, options))
                }, details.attrs),
                details.children.map(function(option) {
                    return m("option", assign({
                            value : optvalue(option)
                        }, option.attrs),
                        option.name
                    );
                })
            )
        );
    }
};
