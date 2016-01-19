"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    times  = require("lodash.times"),

    hide = require("./lib/hide"),

    children     = require("./children"),
    instructions = require("./instructions"),

    css   = require("./repeating.css");

function child(ctrl, options, data, idx) {
    return m("div", { class : css[idx === 0 ? "first" : "child"] },
        m("div", { class : css.counter }, idx + 1),
        m.component(children, assign({}, options, {
            details : options.details.children,
            class   : css.fields,
            data    : data,
            path    : options.path.concat(idx)
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

        ctrl.add = function(options) {
            ctrl.children += 1;

            // Ensure that we have data placeholders for all the possible entries
            times(ctrl.children, function(idx) {
                if(options.data && options.data[idx]) {
                    return;
                }
                
                options.update(options.path.concat(idx), "placeholder");
            });
        };

        ctrl.remove = function(options, data, idx) {
            options.data.splice(idx, 1);

            ctrl.children = options.data.length;
            
            options.update(options.path, options.data);
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
            hidden  = hide(options);
        
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
            }, details.button || "Add")
        );
    }
};
