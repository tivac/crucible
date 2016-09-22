import m from "mithril";
import capitalize from "lodash.capitalize";

import watch from "../../lib/watch";
import db from "../../lib/firebase";
import update from "../../lib/update";
import prefix from "../../lib/prefix";

import * as editor from "./editor";
import * as children from "../../types/children";
import * as layout from "../layout/index";

import css from "./schema-edit.css";

export function controller() {
    var ctrl   = this,
        id     = vnode.attrs.schema,
        ref    = db.child("schemas/" + id),
        worker = new Worker(prefix("/gen/parse-schema.js"));

    ctrl.ref     = ref;
    ctrl.schema  = null;
    ctrl.worker  = worker;
    ctrl.data    = {};
    ctrl.preview = {
        valid : true,
        value : ""
    };
    
    // Get Firebase data
    ref.on("value", function(snap) {
        ctrl.schema = snap.val();

        if(!ctrl.preview.value) {
            ctrl.preview.value = ctrl.schema.preview || "";
        }
        
        // Ensure that we run it through the worker asap
        if(ctrl.schema.source) {
            worker.postMessage(ctrl.schema.source);
        }

        m.redraw();
    });

    // Event Handlers
    ctrl.previewChanged = function(e) {
        var el = e.target;

        ctrl.preview.valid = el.validity.valid;
        ctrl.preview.value = el.value;

        ref.child("preview").set(el.value);
    };
    
    ctrl.slugChanged = function(value) {
        ref.child("slug").set(value);
    };
    
    // Listen for the worker to finish and update firebase
    worker.addEventListener("message", function(e) {
        var data = JSON.parse(e.data);
        
        if(data.error) {
            ctrl.error = true;
        } else {
            ref.child("fields").set(data.config);
            ctrl.error = false;
        }
        
        m.redraw();
    });

    watch(ref);
}

export function view(vnode) {
    if(!vnode.state.schema) {
        return m(layout);
    }
    
    return m(layout, {
        title   : "Edit - " + capitalize(vnode.state.schema.name),
        content : m("div", { class : layout.css.content },
            vnode.state.error ?
                m("p", { class : css.error }, vnode.state.error) :
                null,

            m("div", { class : css.meta },
                m("h3", "Metadata"),
                m("div", { class : css.sections },
                    m("div", { class : css.section },
                        m("label", { class : css.label, for : "preview" }, "Preview URL Base"),
                        m("input", {
                            // Attrs
                            id    : "preview",
                            class : css[vnode.state.preview.valid ? "preview" : "previewError"],
                            type  : "url",
                            value : vnode.state.preview.value || "",
                            
                            // Events
                            oninput : vnode.state.previewChanged,
                            
                            // Config Fn
                            oncreate : function(vnode) {
                                vnode.state.preview.valid = vnode.dom.validity.valid;
                            }
                        }),
                        m("p", { class : css.note },
                            vnode.state.preview.value ?
                                vnode.state.preview.value + "-0IhUBgUFfhyLQ2m6s5x" :
                                null
                        )
                    ),
                    m("div", { class : css.section },
                        m("label", { class : css.label },
                            m("input", {
                                // Attrs
                                css     : css.slug,
                                type    : "checkbox",
                                checked : vnode.state.schema.slug,
                                
                                // Events
                                onchange : m.withAttr("checked", vnode.state.slugChanged)
                            }),
                            " Generate slugs for entries?"
                        )
                    )
                )
            ),
            m("div", { class : css.contents },
                m("div", { class : css.editor },
                    m("h3", "Field Definitions"),
                    m(editor, {
                        ref    : vnode.state.ref,
                        worker : vnode.state.worker,
                        source : vnode.state.schema.source || "{\n\n}"
                    })
                ),

                m("div", { class : css.fields },
                    m("h3", "Preview"),
                    m(children, {
                        fields : vnode.state.schema.fields,
                        data   : vnode.state.data,
                        path   : [],
                        state  : vnode.state.data,
                        update : update.bind(null, vnode.state.data)
                    })
                )
            )
        )
    });
}
