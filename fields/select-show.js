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
            
            if(!ctrl.field.options) {
                ctrl.field.options = {};
            }
            
            m.redraw();
        });
        
        if(options.callback) {
            ctrl.onchange = function(value) {
                // Send back the key of the selected item
                options.callback(Object.keys(ctrl.field.options)[value]);
            };
        }
    },

    view : function(ctrl, options) {
        if(!ctrl.field) {
            return m.component(fields.loading);
        }
        
        return m("label", ctrl.field.name + ": ",
            m("select", assign({}, ctrl.field, { onchange : m.withAttr("selectedIndex", ctrl.onchange) }),
                Object.keys(ctrl.field.options).map(function(key) {
                    var option = ctrl.field.options[key];
                    
                    return m("option", {
                        value    : option.value || option.name,
                        selected : option.selected
                    }, option.name);
                })
            )
        );
    }
};
