"use strict";

var m          = require("mithril"),
    debounce   = require("lodash.debounce"),
    capitalize = require("lodash.capitalize"),

    children = require("../types/children"),

    watch  = require("../lib/watch"),
    db     = require("../lib/firebase"),
    update = require("../lib/update"),

    editor = require("./schema-edit/editor"),

    layout = require("./layout"),
    css    = require("./schema-edit.css");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("schema"),
            ref  = db.child("schemas/" + id);

        ctrl.ref     = ref;
        ctrl.schema  = null;
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

            m.redraw();
        });

        // Event Handlers
        ctrl.previewChanged = function(e) {
            var el = e.target;

            ctrl.preview.valid = el.validity.valid;
            ctrl.preview.value = el.value;

            ref.child("preview").set(el.value);
        };

        watch(ref);
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m.component(layout);
        }

        return m.component(layout, {
            title   : "Edit - " + capitalize(ctrl.schema.name),
            content : [
                m(".body", { class : css.body },
                        m("div", { class : css.meta },
                        m("h3", "Metadata"),
                        m("label", { class : css.label, for : "preview" }, "Preview URL Base"),
                        m("input", {
                            id    : "preview",
                            class : css[ctrl.preview.valid ? "preview" : "previewError"],
                            type  : "url",
                            value : ctrl.preview.value || "",

                            oninput : ctrl.previewChanged,
                            config  : function(el, init) {
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
                    m("div", { class : css.contents },
                        m("div", { class : css.editor },
                            m("h3", "Field Definitions"),
                            m.component(editor, {
                                ref    : ctrl.ref,
                                source : ctrl.schema.source || "{\n\n}"
                            })
                        ),

                        m("div", { class : css.fields },
                            m("h3", "Preview"),
                            m.component(children, {
                                details : ctrl.schema.fields,
                                data    : ctrl.data,
                                path    : [],
                                state   : ctrl.data,
                                update  : update.bind(null, false, ctrl.data)
                            })
                        )
                    )
                )
            ]
        });
    }
};
