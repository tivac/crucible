"use strict";

var m      = require("mithril"),
    editor = require("codemirror"),
    Remarkable = require("remarkable"),
    md = new Remarkable(),

    hide  = require("./lib/hide"),
    label = require("./lib/label"),
    
    css = require("./markdown.css");

require("codemirror/mode/markdown/markdown");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.markdown = options.data || "";
        ctrl.previewing = m.prop(false);
        ctrl.previewHTML = m.prop(null);

        ctrl.togglePreview = function(e) {
            e.preventDefault();

            ctrl.previewHTML(md.render(ctrl.markdown));
            ctrl.previewing(!ctrl.previewing());
        };

        ctrl.editorSetup = function(el, init) {
            if(init) {
                return;
            }

            ctrl.editor = editor.fromTextArea(el, {
                mode : "text/x-markdown",
                lint : true,

                indentUnit   : 4,
                smartIndent  : false,
                lineNumbers  : false,
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

            ctrl.editor.on("changes", function() {
                ctrl.markdown = ctrl.editor.doc.getValue();

                options.update(options.path, ctrl.markdown);
            });
        };
    },

    view : function(ctrl, options) {
        var hidden  = hide(options);

        if(hidden) {
            return hidden;
        }

        return m("",
            label(ctrl, options),
            m("", { class : css.input + (ctrl.previewing() ? " hidden" : "") },
                m("textarea", { config : ctrl.editorSetup },
                    ctrl.markdown
                )
            ),
            m("div", { class : css.input + (ctrl.previewing() ? "" : " hidden") },
                m.trust(ctrl.previewHTML())
            ),
            m("button.pure-button", {
                    onclick : ctrl.togglePreview,
                    class   : css.button
                },
                ctrl.previewing() ? "Edit" : "Preview"
            )
        );
    }
};
