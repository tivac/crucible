"use strict";

var m   = require("mithril"),
    get = require("lodash.get"),

    types = require("../types");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;

        return m("div",
            Object.keys(details || {}).map(function(key) {
                var field = details[key];

                return m("div",
                    m.component(types.components[field.type || field], {
                        name    : key,
                        details : field,
                        data    : get(options, "data." + key),
                        ref     : options.ref && options.ref.child(key)
                    })
                );
            })
        );
    }
};
