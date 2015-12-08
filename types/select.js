"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    types = require("./types.css");

function optvalue(option) {
    return option.value || option.name
}

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.onchange = function(options, index) {
            var opt = options.details.children[index];
            
            options.ref.set(optvalue(opt));
        };
    },
    
    view : function(ctrl, options) {
        var details = options.details,
            value   = options.data;
        
        // Need to go see if one of the options should be already selected
        if(!value) {
            details.children.some(function(opt) {
                if(opt.selected) {
                    value = optvalue(opt);
                }
                
                return value;
            });
        }
        
        return m("div", { class : types[options.index ? "field" : "first"].join(" ") },
            m("label", { class : types.label.join(" ") }, details.name,
                m("select", assign({
                        onchange : options.ref && m.withAttr("selectedIndex", ctrl.onchange.bind(ctrl, options)),
                        value    : value
                    }, details.attrs),
                    details.children.map(function(opt) {
                        return m("option", {
                                value : opt.value || opt.name
                            },
                            opt.name
                        );
                    })
                )
            )
        );
    }
};
