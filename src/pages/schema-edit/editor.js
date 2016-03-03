"use strict";

var m        = require("mithril"),
    editor   = require("codemirror"),
    debounce = require("lodash.debounce");

// Require codemirror extra JS bits and bobs so they're included
// since codemirror isn't commonjs :(
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/edit/closebrackets");
require("codemirror/addon/selection/active-line");
require("codemirror/addon/comment/continuecomment");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        // Set up codemirror
        ctrl.editorSetup = function(el, init) {
            if(init) {
                return;
            }

            ctrl.editor = editor.fromTextArea(el, {
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

                        return cm.execCommand(cm.options.indentWithTabs ? "insertTab" : "insertSoftTab");
                    },

                    "Shift-Tab" : function(cm) {
                        cm.indentSelection("subtract");
                    }
                }
            });

            ctrl.editor.on("changes", debounce(function() {
                var text = ctrl.editor.doc.getValue();

                options.ref.child("source").set(text);
                
                options.worker.postMessage(text);
            }, 500, { maxWait : 5000 }));
        };
    },
    
    view : function(ctrl, options) {
        return m("textarea", { config : ctrl.editorSetup },
            options.source
        );
    }
};
