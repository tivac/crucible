"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    css = require("./select.css");

module.exports = require("./lib/multiple")({
        multiple : false
    },

    function(ctrl, options) {
        var details = options.details;

        return m("select", assign({
                // attrs
                class : css.select,
                
                // events
                onchange : function(e) {
                    var tgt = e.target,
                        opt = details.children[tgt.selectedIndex];
                    
                    ctrl.value(options, opt.key, opt.value);
                }
            }, details.attrs),
            details.children.map(function(option) {
                return m("option", assign({}, option.attrs, { value : option.value }),
                    option.name
                );
            })
        );
    }
);
