"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    css = require("./select.css");

module.exports = require("./lib/multiple")({
        multiple : false
    },

    function(ctrl, options) {
        var field = options.field;

        return m("select", assign({
                // attrs
                class : css.select,

                // events
                onchange : function(e) {
                    var tgt = e.target,
                        opt = field.children[tgt.selectedIndex];

                    ctrl.value(options, opt.key, opt.value);
                }
            }, field.attrs),
            field.children.map(function(option) {
                return m("option", assign({}, option.attrs, { value : option.value }),
                    option.name
                );
            })
        );
    }
);
