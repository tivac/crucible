"use strict";

// Require codemirror extra JS bits and bobs so it works
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/dialog/dialog");
require("codemirror/addon/search/searchcursor");
require("codemirror/addon/search/search");
require("codemirror/addon/search/matchesonscrollbar");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/edit/closebrackets");
require("codemirror/addon/fold/foldcode");
require("codemirror/addon/fold/foldgutter");
require("codemirror/addon/fold/brace-fold");
require("codemirror/addon/lint/lint");
require("../lib/cm-json-lint");

var m      = require("mithril"),
    assign = require("lodash.assign"),
    Editor = require("codemirror"),

    types  = require("../types"),
    db     = require("../lib/firebase"),

    css    = require("./schemas-edit.css");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            ref  = db.child("schemas/" + id);
        
        ctrl.schema = null;
        ctrl.recent = null;

        ref.on("value", function(snap) {
            ctrl.schema = {
                fields : {}
            };
            
            // Iterate everything but fields first
            snap.forEach(function(field) {
                if(snap.key() === "fields") {
                    return;
                }
                
                ctrl.schema[snap.key()] = snap.val();
            });
            
            // Then iterate fields in priority order
            snap.child("fields").forEach(function(field) {
                ctrl.schema.fields[field.key()] = field.val() ;
            });
            
            m.redraw();
        });

        // Ensure the updated timestamp is always accurate-ish
        ref.on("child_changed", function(snap) {
            if(snap.key() === "updated") {
                return;
            }

            ref.child("updated").set(db.TIMESTAMP);
        });

        // get 5 latest entries using this type to display
        db.child("content").orderByChild("type").equalTo(id).limitToLast(5).on("value", function(snap) {
            ctrl.recent = snap.val();

            m.redraw();
        });

        ctrl.editorSetup = function(el, init) {
            if(init) {
                return;
            }

            ctrl.editor = Editor.fromTextArea(el, {
                mode         : "application/json",
                lint         : true,
                gutters      : [ "CodeMirror-lint-markers", "CodeMirror-foldgutter" ],
                lineNumbers  : true,
                indentUnit   : 4,
                lineWrapping : true,
                foldGutter   : true
            });

            ctrl.editor.on("changes", ctrl.editorChanged);
        };

        ctrl.editorChanged = function() {
            var config;

            // Ensure JSON is still valid before applying
            try {
                config = JSON.parse(ctrl.editor.doc.getValue());
            } catch(e) {
                return;
            }
            
            Object.keys(config).forEach(function(key, idx) {
                ref.child("fields").child(key).setWithPriority(config[key], idx);
            });
        };
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m("h1", "Loading...");
        }

        return m("div", { class : css.page.join(" ") },
            m("div", { class : css.meta.join(" ") },
                m("h1", ctrl.schema.name),
                m("h2", "Recent Entries"),
                m("ul",
                    Object.keys(ctrl.recent || {}).map(function(key) {
                        return m("li",
                            m("a", { href : "/content/" + key, config : m.route }, ctrl.recent[key].name)
                        );
                    })
                ),
                m("hr")
            ),
            m("div", { class : css.contents.join(" ") },
                m("div", { class : css.editor.join(" ") },
                    m("textarea", { config : ctrl.editorSetup, },
                        JSON.stringify(ctrl.schema.fields || {}, null, 4)
                    )
                ),

                m("div", { class : css.fields.join(" ") },
                    m.component(types.components.fields, { details : ctrl.schema.fields })
                )
            )
        );
    }
};
