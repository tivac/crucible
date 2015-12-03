"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    get    = require("lodash.get"),

    fields = require("./");

function optvalue(option) {
    return get(option, "attrs.value") || option.name
}

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.onchange = function(options, index) {
            var key = Object.keys(options.details.options)[index],
                opt = options.details.options[key];
            
            options.ref.set(optvalue(opt));
        };
    },
    
    view : function(ctrl, options) {
        var details = options.details,
            opts    = Object.keys(details.options || {}),
            value   = options.data;
        
        // Need to go see if one of the options was set to be selected
        if(!value) {
            opts.some(function(opt) {
                if(details.options[opt].selected) {
                    value = optvalue(details.options[opt]);
                }
                
                return value;
            });
        }
        
        return m("label", details.name + ": ",
            m("select", assign({
                    onchange : options.ref && m.withAttr("selectedIndex", ctrl.onchange.bind(ctrl, options)),
                    value    : value
                }, details.attrs),
                opts.map(function(key) {
                    return m.component(fields.components.option.show, {
                        id      : key,
                        details : details.options[key]
                    });
                })
            )
        );
    }
};
