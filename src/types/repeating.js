"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    times  = require("lodash.times"),
    
    config = require("../config"),
    
    hide     = require("./lib/hide"),
    children = require("./children"),

    css = require("./repeating.css"),
    
    icons = config.icons;

function child(ctrl, options, data, idx) {
    return m("div", { class : css[idx === 0 ? "first" : "child"] },
        m("div", { class : css.meta },
            m("p", { class : css.counter }, idx + 1),
            m("button", {
                    class   : css.remove,
                    onclick : ctrl.remove.bind(ctrl, options, data, idx)
                },
                m("svg", { class : css.icon },
                    m("use", { href : icons + "#remove" })
                )
            )
        ),
        m.component(children, assign({}, options, {
            fields : options.field.children,
            class  : css.fields,
            data   : data,
            path   : options.path.concat(idx)
        }))
    );
}

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.children = (options.data && options.data.length) || 1;
        
        ctrl.add = function(opts) {
            ctrl.children += 1;

            // Ensure that we have data placeholders for all the possible entries
            times(ctrl.children, function(idx) {
                if(opts.data && opts.data[idx]) {
                    return;
                }
                
                // Need a key here so that firebase will save this object,
                // otherwise future loads can have weird gaps
                opts.update(opts.path.concat(idx), { __idx : idx });
            });
        };

        ctrl.remove = function(opts, data, idx) {
            if(Array.isArray(opts.data)) {
                opts.data.splice(idx, 1);
                
                ctrl.children = opts.data.length;
            } else {
                --ctrl.children;
            }
            
            opts.update(opts.path, opts.data);
        };
    },

    view : function(ctrl, options) {
        var field   = options.field,
            hidden  = hide(options),
            items;
        
        if(hidden) {
            return hidden;
        }
        
        if(options.data) {
            items = options.data.map(child.bind(null, ctrl, options));
        } else {
            items = times(ctrl.children, child.bind(null, ctrl, options, false));
        }
        
        return m("div", { class : options.class + " " + css.container },
            items,
            m("button", {
                class   : css.add,
                onclick : ctrl.add.bind(ctrl, options)
            }, field.button || "Add")
        );
    }
};
