import m from "mithril";
import Remarkable from "remarkable";
import editor from "codemirror";

import id from "./lib/id";
import label from "./lib/label";

import css from "./markdown.css";

var md = new Remarkable();

import "codemirror/mode/markdown/markdown";

export default {
    oninit (vnode) {
        var ctrl = this;
        
        ctrl.id       = id(vnode.attrs);
        ctrl.markdown = vnode.attrs.data || "";
        ctrl.previewing = false;
        ctrl.previewHTML = null;
        
        ctrl.options = vnode.attrs;

        ctrl.togglePreview = function(e) {
            e.preventDefault();

            ctrl.previewHTML = md.render(ctrl.markdown);
            ctrl.previewing = !ctrl.previewing;
        };

        ctrl.editorChanged = function() {
            ctrl.markdown = ctrl.editor.doc.getValue();

            ctrl.options.update(ctrl.options.path, ctrl.markdown);
        };

        ctrl.editorSetup = function(el, init) {
            if(init) {
                return;
            }

            ctrl.editor = editor.fromTextArea(el, {
                mode : "text/x-markdown",

                indentUnit   : 4,
                lineWrapping : true
            });

            ctrl.editor.on("changes", ctrl.editorChanged);
        };
    },

    view : function(vnode) {
        vnode.state.options = vnode.attrs;

        return m("div", { class : vnode.attrs.class },
            label(vnode.state, vnode.attrs),
            m("div", { class : vnode.state.previewing ? css.inputHidden : css.input },
                m("textarea", { config : vnode.state.editorSetup },
                    vnode.state.markdown
                )
            ),
            m("div", { class : vnode.state.previewing ? css.input : css.inputHidden },
                m.trust(vnode.state.previewHTML)
            ),
            m("button.pure-button", {
                    onclick : vnode.state.togglePreview,
                    class   : css.button
                },
                vnode.state.previewing ? "Edit" : "Preview"
            )
        );
    }
};
