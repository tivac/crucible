import m from "mithril";
import capitalize from "lodash.capitalize";

import watch from "../../lib/watch";
import db from "../../lib/firebase";
import prefix from "../../lib/prefix";

import Content from "../content-edit/content-state";

import * as editor from "./editor";
import * as children from "../../types/children";
import * as layout from "../layout/index";

import css from "./schema-edit.css";
import flexCss from "../../flex.css";

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
    var content = new Content(),
        state   = content.get();

    if(!ctrl.schema) {
        return m.component(layout, { inProgress : true });
    }

    return m.component(layout, {
        title   : "Edit Schema: " + capitalize(ctrl.schema.name),
        content : m("div", { class : layout.css.content },
            ctrl.error ?
                m("p", { class : css.error }, ctrl.error) :
                null,

            m("div", { class : layout.css.body },
                m("h1", { class : css.title }, "Edit Schema: " + capitalize(ctrl.schema.name)),

                m("div", { class : css.contentWidth },

                    m("div", { class : css.definitions },
                        m("h2", "Field Definitions"),
                        m("div", { class : css.editor },
                            m.component(editor, {
                                ref    : ctrl.ref,
                                worker : ctrl.worker,
                                source : ctrl.schema.source || "{\n\n}"
                            })
                        )
                    ),

                    m("div", { class : css.preview },
                        m("h2", "Preview"),
                        m("div", { class : css.fields },
                            m.component(children, {
                                fields : ctrl.schema.fields,
                                class  : css.children,
                                data   : state.fields || {},
                                path   : [ "fields" ],
                                state  : state.fields,

                                update  : content.setField.bind(content),
                                content : content,

                                registerHidden : content.hidden.register.bind(content.hidden)
                            })
                        )
                    ),

                    m("div", { class : css.details },
                        m("h2", "Details"),
                        m("label", { class : css.genSlugs },
                            "Generate slugs for entries? ",
                            m("input", {
                                // Attrs
                                class   : css.slug,
                                type    : "checkbox",
                                checked : ctrl.schema.slug,

                                // Events
                                onchange : m.withAttr("checked", ctrl.slugChanged)
                            })
                        ),
                        m("div", { class : css.urlBase },
                            m("label", { for : "preview" }, "Preview URL base: "),
                            m("span", { class : css.url },
                                m("input", {
                                    // Attrs
                                    id    : "preview",
                                    class : css[ctrl.preview.valid ? "urlInputPreview" : "urlInputError"],
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
                                m("p", { class : css.previewUrl },
                                    ctrl.preview.value ?
                                        ctrl.preview.value + "-0IhUBgUFfhyLQ2m6s5x" :
                                        null
                                )
                            )
                        )
                    )
                )
            )
        )
    });
}
