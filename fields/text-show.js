"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    fields = require("./index");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.field = {};
                
        options.field.on("value", function(snap) {
            ctrl.field = snap.val();
            
            m.redraw();
        });
        
        if(options.callback) {
            ctrl.oninput = function(value) {
                options.callback(value);
            };
        }
    },

    view : function(ctrl, options) {
        if(!ctrl.field) {
            return m.component(fields.loading);
        }
        
        return m("label", ctrl.field.name + ": ",
            m("input", assign({}, ctrl.field, { value : options.data || "" }, {
                oninput : m.withAttr("value", ctrl.oninput)
            }))
        );
    }
};
