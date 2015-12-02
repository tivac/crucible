"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db    = require("../lib/firebase"),
    types = require("./index");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div",
            details.name + " REPEATING:",
            m("div",
                Object.keys(details.fields || {}).map(function(key) {
                    var field = details.fields[key];

                    return m("div",
                        m.component(types.components[field.type].show, { details : field })
                    );
                })
            )
        );
    }
};
