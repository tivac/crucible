"use strict";

var m        = require("mithril"),
    debounce = require("lodash.debounce"),
    Editor   = require("codemirror"),

    children = require("../types/children"),

    watch    = require("../lib/watch"),
    db       = require("../lib/firebase"),
    
    layout = require("./layout"),

    css    = require("./schema-edit.css");

// Require codemirror extra JS bits and bobs so they're included
// since codemirror isn't commonjs
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/edit/closebrackets");
require("codemirror/addon/selection/active-line");
require("codemirror/addon/comment/continuecomment");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("schema"),
            ref  = db.child("schemas/" + id),
            // Weird path is because this isn't browserified
            save = new Worker("/src/workers/save-schema.js");
        
        ctrl.schema = null;
        ctrl.recent = null;

        // Listen for updates from Firebase
        ref.on("value", function(snap) {
            ctrl.schema = snap.val();
            
            m.redraw();
        });

        // Take processed code from worker, save it to firebase
        save.addEventListener("message", function(e) {
            ref.child("fields").set(e.data);
        });
        
        // Set up codemirror
        ctrl.editorSetup = function(el, init) {
            if(init) {
                return;
            }

            ctrl.editor = Editor.fromTextArea(el, {
                mode : "application/javascript",
                lint : true,
                
                indentUnit   : 4,
                smartIndent  : false,
                lineNumbers  : true,
                lineWrapping : true,
                
                // Plugin options
                styleActiveLine  : true,
                continueComments : true,
                
                autoCloseBrackets : true,
                matchBrackets     : true,

                extraKeys : {
                    Tab : function(cm) {
                        if(cm.somethingSelected()) {
                            return cm.indentSelection("add");
                        }
                        
                        cm.execCommand(cm.options.indentWithTabs ? "insertTab" : "insertSoftTab");
                    },
                    
                    "Shift-Tab" : function(cm) {
                        cm.indentSelection("subtract");
                    }
                }
            });

            // Respond to editor changes, but debounced.
            ctrl.editor.on("changes", debounce(ctrl.editorChanged, 100, { maxWait : 10000 }));
        };
        
        // Handle codemirror change events
        ctrl.editorChanged = function() {
            var text = ctrl.editor.doc.getValue();

            ref.child("source").set(text);
            save.postMessage(text);
        };
        
        watch(ref);
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m.component(layout);
        }
        
        return m.component(layout, {
            title   : "Edit - " + ctrl.schema.name,
            content : [
                m("div", { class : css.contents },
                    m("div", { class : css.editor },
                        m("textarea", { config : ctrl.editorSetup, },
                            ctrl.schema.source || "{}"
                        )
                    ),

                    m("div", { class : css.fields },
                        m.component(children, {
                            details : ctrl.schema.fields
                        })
                    )
                )
            ]
        });

    }
};
