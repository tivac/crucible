"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    times  = require("lodash.times"),

    hide = require("./lib/hide"),

    children     = require("./children"),

    css   = require("./repeating.css");

function child(ctrl, options, data, idx) {
    return m("div", { class : css[idx === 0 ? "first" : "child"] },
        m("div", { class : css.counter }, idx + 1),
        m.component(children, assign({}, options, {
            fields : options.field.children,
            class  : css.fields,
            data   : data,
            path   : options.path.concat(idx)
        })),
        m("div", { class : css.counter },
            m("button", {
                    class   : css.remove,
                    onclick : ctrl.remove.bind(ctrl, options, data, idx)
                },
                "Remove"
            )
        )
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
                
                opts.update(opts.path.concat(idx), "placeholder");
            });
        };

        ctrl.remove = function(opts, data, idx) {
            opts.data.splice(idx, 1);

            ctrl.children = opts.data.length;
            
            opts.update(opts.path, opts.data);
        };
    },

    view : function(ctrl, options) {
        var field  = options.field,
            hidden = hide(options);
        
        if(hidden) {
            return hidden;
        }
        
        return m("div", { class : options.class + " " + css.container },
            options.data ?
                options.data.map(child.bind(null, ctrl, options)) :
                times(ctrl.children, child.bind(null, ctrl, options, false)),
            m("button", {
                class   : css.add,
                onclick : ctrl.add.bind(ctrl, options)
            }, field.button || "Add")
        );
    }
};
