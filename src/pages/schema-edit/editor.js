import m from "mithril";
import editor from "codemirror";
import debounce from "lodash.debounce";

// Require codemirror extra JS bits and bobs so they're included
// since codemirror isn't commonjs :(
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/selection/active-line";
import "codemirror/addon/comment/continuecomment";

export function controller(options) {
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
}

export function view(ctrl, options) {
    return m("textarea", { config : ctrl.editorSetup },
        options.source
    );
}
