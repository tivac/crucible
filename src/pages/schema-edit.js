"use strict";

var m        = require("mithril"),
    debounce = require("lodash.debounce"),
    Editor   = require("codemirror"),

    children = require("../types/children"),

    watch = require("../lib/watch"),
    db    = require("../lib/firebase"),

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
            parse = new Worker("/src/pages/schema-edit/parse.js");

        ctrl.schema  = null;
        ctrl.recent  = null;
        ctrl.preview = true;

        // Listen for updates from Firebase
        ref.on("value", function(snap) {
            ctrl.schema = snap.val();

            m.redraw();
        });

        // Take processed schema from worker, save it to firebase
        parse.addEventListener("message", function(e) {
            console.log(e);
            
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
            parse.postMessage(text);
        };

        ctrl.previewChanged = function(e) {
            var el = e.target;

            ctrl.preview = el.validity.valid;

            ref.child("preview").set(el.value);
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
                m(".body", { class : css.body },
                        m("div", { class : css.meta },
                        m("h3", "Metadata"),
                        m("label", { class : css.label, for : "preview" }, "Preview URL Base"),
                        m("input", {
                            id    : "preview",
                            class : css[ctrl.preview ? "preview" : "previewError"],
                            type  : "url",
                            value : ctrl.schema.preview || "",

                            oninput : ctrl.previewChanged,
                            config  : function(el, init) {
                                if(init) {
                                    return;
                                }

                                ctrl.preview = el.validity.valid;
                            }
                        }),
                        m("p", { class : css.note }, ctrl.schema.preview ? ctrl.schema.preview + "-0IhUBgUFfhyLQ2m6s5x" : null)
                    ),
                    m("div", { class : css.contents },
                        m("div", { class : css.editor },
                            m("h3", "Field Definitions"),
                            m("textarea", { config : ctrl.editorSetup },
                                ctrl.schema.source || "{}"
                            )
                        ),

                        m("div", { class : css.fields },
                            m("h3", "Preview"),
                            m.component(children, {
                                details : ctrl.schema.fields
                            })
                        )
                    )
                )
            ]
        });
    }
};
