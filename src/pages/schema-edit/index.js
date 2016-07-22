import m from "mithril";
import capitalize from "lodash.capitalize";

import watch from "../../lib/watch.js";
import db from "../../lib/firebase.js";
import update from "../../lib/update.js";
import { prefix } from "../../lib/routes.js";

import * as editor from "./editor.js";
import * as children from "../../types/children.js";
import * as layout from "../layout/index.js";

import css from "./schema-edit.css";

export function controller() {
    var ctrl   = this,
        id     = m.route.param("schema"),
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

export function view(ctrl) {
    if(!ctrl.schema) {
        return m.component(layout);
    }
    
    return m.component(layout, {
        title   : "Edit - " + capitalize(ctrl.schema.name),
        content : m("div", { class : layout.css.content },
            ctrl.error ?
                m("p", { class : css.error }, ctrl.error) :
                null,

            m("div", { class : css.meta },
                m("h3", "Metadata"),
                m("div", { class : css.sections },
                    m("div", { class : css.section },
                        m("label", { class : css.label, for : "preview" }, "Preview URL Base"),
                        m("input", {
                            // Attrs
                            id    : "preview",
                            class : css[ctrl.preview.valid ? "preview" : "previewError"],
                            type  : "url",
                            value : ctrl.preview.value || "",
                            
                            // Events
                            oninput : ctrl.previewChanged,
                            
                            // Config Fn
                            config : function(el, init) {
                                if(init) {
                                    return;
                                }

                                ctrl.preview.valid = el.validity.valid;
                            }
                        }),
                        m("p", { class : css.note },
                            ctrl.preview.value ?
                                ctrl.preview.value + "-0IhUBgUFfhyLQ2m6s5x" :
                                null
                        )
                    ),
                    m("div", { class : css.section },
                        m("label", { class : css.label },
                            m("input", {
                                // Attrs
                                css     : css.slug,
                                type    : "checkbox",
                                checked : ctrl.schema.slug,
                                
                                // Events
                                onchange : m.withAttr("checked", ctrl.slugChanged)
                            }),
                            " Generate slugs for entries?"
                        )
                    )
                )
            ),
            m("div", { class : css.contents },
                m("div", { class : css.editor },
                    m("h3", "Field Definitions"),
                    m.component(editor, {
                        ref    : ctrl.ref,
                        worker : ctrl.worker,
                        source : ctrl.schema.source || "{\n\n}"
                    })
                ),

                m("div", { class : css.fields },
                    m("h3", "Preview"),
                    m.component(children, {
                        fields : ctrl.schema.fields,
                        data   : ctrl.data,
                        path   : [],
                        state  : ctrl.data,
                        update : update.bind(null, ctrl.data)
                    })
                )
            )
        )
    });
}
