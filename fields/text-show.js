"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    loading = require("./loading");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.oninput = function(value) {
            options.callback(value);
        };
    },

    view : function(ctrl, options) {
        var field = options.field;

        return m("label", field.name + ": ",
            m("input", assign({}, field, { value : options.data || "" }, {
                oninput : m.withAttr("value", ctrl.oninput)
            }))
        );
    }
};
