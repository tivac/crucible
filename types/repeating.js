"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    times  = require("lodash.times"),
    
    children     = require("./children"),
    instructions = require("./instructions"),

    types = require("./types.css"),
    css   = require("./repeating.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.children = (options.data && options.data.length) || 0;

        ctrl.add = function(e) {
            ++ctrl.children;
        };
    },

    view : function(ctrl, options) {
        var details = options.details;

        return m("div", { class : types[options.index ? "field" : "first"].join(" ") },
            details.instructions ? m.component(instructions, { details : details.instructions }) : null,
            options.data ?
                options.data.map(function(data, idx) {
                    return m("div", { class : css.child.join(" ") },
                        m("p", idx),
                        m.component(children, {
                            details : details.children,
                            data    : data,
                            ref     : options.ref && options.ref.child(idx)
                        })
                    );
                }) : [
                    times(ctrl.children, function(idx) {
                        return m("div", { class : css.child.join(" ") },
                            m("p", idx),
                            m.component(children, {
                                details : details.children,
                                ref     : options.ref && options.ref.child(idx)
                            })
                        );
                    }),
                    m("button", { onclick : ctrl.add }, "Add")
                ]
        );
    }
};
