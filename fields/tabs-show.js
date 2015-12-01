"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db      = require("../lib/firebase"),
    loading = require("./loading");

module.exports = {
    controller : function(options) {
        var ctrl   = this,
            ref    = options.ref,
            fields = db.child("fields");
        
        ref.on("value", function(snap) {
            ctrl.field = snap.val();

            if(ctrl.field && !ctrl.field.tabs) {
                ctrl.field.tabs = {};
            }
            
            m.redraw();
        });
        
        if(options.callback) {
            ctrl.oninput = function(value) {
                options.callback(value);
            };
        }
    },

    view : function(ctrl, options) {
        if(!("field" in ctrl)) {
            return m.component(loading);
        }
        
        if(ctrl.field === null) {
            return m("span", "BYE!");
        }
        
        return m("div",
            "TABS:",
            Object.keys(ctrl.field.tabs).map(function(key) {
                var tab = ctrl.field.tabs[key];

                return m("p", tab.title);
            })
        );
    }
};
