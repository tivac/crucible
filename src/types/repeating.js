"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    times  = require("lodash.times"),
    
    children     = require("./children"),
    instructions = require("./instructions"),

    css   = require("./repeating.css");

function child(ctrl, options, data, idx) {
    return m("div", { class : css.child },
        m("div", { class : css.counter }, idx + 1),
        m.component(children, assign({}, options, {
            details : options.details.children,
            class   : css.fields,
            data    : data,
            ref     : options.ref && options.ref.child(idx)
        })),
        m("div", { class : css.counter },
            m("button", {
                    onclick : ctrl.remove.bind(ctrl, options, data, idx)
                },
                m("i.material-icons", "remove")
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

            if(!options.ref) {
                return;
            }
    
            // Ensure that we have data placeholders for all the possible entries
            times(ctrl.children, function(idx) {
                if(options.data && options.data[idx]) {
                    return;
                }

                options.ref.child(idx).set("placeholder");
            });
        };
        
        ctrl.remove = function(options, data, idx, e) {
            // No ref means we don't much care
            if(!options.ref || !options.data) {
                return --ctrl.children;
            }

            options.data.splice(idx, 1);

            ctrl.children = options.data.length;

            options.ref.set(options.data);
        };
    },

    view : function(ctrl, options) {
        var details = options.details;

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
