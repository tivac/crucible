"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    types  = require("../types"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.ref    = ref;
        ctrl.edit   = null;
        ctrl.recent = null;

        // Add a new field to this collection
        ctrl.add = function(type, e) {
            e.preventDefault();
            
            // Create the field & start editing it
            ref.child("fields").once("value", function(snap) {
                var key = type + "-" + snap.numChildren();
                
                ref.child("fields/" + key).setWithPriority(
                    assign({ type : type }, types.defaults[type] || { name : type }),
                    snap.numChildren()
                );
                
                ctrl.edit = key;
                
                m.redraw();
            });
        };

        // Remove the targetted field
        ctrl.remove = function(key) {
            ref.child("fields/" + key).remove();
        };

        // Mark a field as editing so editing controls can be drawn
        ctrl.editing = function(key) {
            ctrl.edit = key;
        };
    },

    view : function(ctrl, options) {
        var details = options.details;

        return m("div",
            m("p",
                m("strong", "Add a field: "),
                types.map(function(type) {
                    return m("button", {
                        onclick : ctrl.add.bind(ctrl, type)
                    }, type);
                })
            ),
            m("hr"),
            Object.keys(details.fields || {}).map(function(key) {
                var field = details.fields && details.fields[key];
                
                if(!field) {
                    return null;
                }
                
                // Firebase won't populate an empty object, so make sure this exists
                if(!field.attrs) {
                    field.attrs = {};
                }

                if(key !== ctrl.edit) {
                    return m("div", { key : "show-" + key },
                        m("button", { "data-key" : key, onclick : m.withAttr("data-key", ctrl.editing) }, "Edit"),
                        m.component(types.components[field.type].show, { details : field })
                    );
                }
                
                return m("div", { key : "edit-" + key },
                    m.component(types.components[field.type].show, { details : field }),
                    m("button", { "data-key" : key, onclick : m.withAttr("data-key", ctrl.remove) }, "Remove"),
                    m.component(types.components[field.type].edit, {
                        details : field,
                        root    : options.root,
                        ref     : ctrl.ref.child("fields/" + key)
                    })
                );
            })
        );
    }
};
