"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db    = require("../lib/firebase"),
    types = require("./index");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div",
            details.name + " TABS:",
            m("div",
                Object.keys(details.tabs || {}).map(function(key) {
                    var tab = details.tabs[key];

                    return m("p",
                        tab.name,
                        Object.keys(tab.fields || {}).map(function(fieldKey) {
                            var field = tab.fields[fieldKey];

                            return m("div",
                                m.component(types.components[field.type].show, { details : field })
                            );
                        })
                    );
                })
            )
        );
    }
};
