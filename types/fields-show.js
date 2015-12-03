"use strict";

var m = require("mithril"),

    types = require("../types"),
    db    = require("../lib/firebase");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
    },

    view : function(ctrl, options) {
        var details = options.details;

        return m("div",
            Object.keys(details.fields || {}).map(function(key) {
                var field = details.fields[key];

                return m("div", { key : "show-" + key },
                    m.component(types.components[field.type].show, {
                        details : field,
                        data    : options.data[key],
                        ref     : options.ref.child(key)
                    })
                );
            })
        );
    }
};
