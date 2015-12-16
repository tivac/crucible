"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    slug   = require("unique-slug"),

    types = require("./types.css");

function optvalue(option) {
    return option.value || option.name
}

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.id = slug(options.details.name);

        ctrl.onchange = function(options, index) {
            var opt = options.details.children[index];
            
            options.ref.set(optvalue(opt));
        };
    },
    
    view : function(ctrl, options) {
        var details = options.details,
            value   = options.data,
            name    = details.name;
            
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
                    onchange : options.ref && m.withAttr("selectedIndex", ctrl.onchange.bind(ctrl, options))
                }, details.attrs),
                details.children.map(function(opt) {
                    return m("option", {
                            value : opt.value || opt.name
                        },
                        opt.name
                    );
                })
            )
        );
    }
};
