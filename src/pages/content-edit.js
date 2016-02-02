"use strict";

var m          = require("mithril"),
    get        = require("lodash.get"),
    merge      = require("lodash.merge"),
    assign     = require("lodash.assign"),
    capitalize = require("lodash.capitalize"),

    children = require("../types/children"),
    db       = require("../lib/firebase"),
    update   = require("../lib/update"),
    watch    = require("../lib/watch"),

    layout = require("./layout"),
    nav    = require("./content-edit/nav"),

    publishing = require("./content-edit/publishing"),

    css = require("./content-edit.css");

module.exports = {
    controller : function() {
        var ctrl = this,

            id     = m.route.param("id"),
            schema = db.child("schemas/" + m.route.param("schema")),
            ref    = db.child("content/" + m.route.param("schema") + "/" + id);

        ctrl.id     = id;
        ctrl.ref    = ref;
        ctrl.data   = null;
        ctrl.schema = null;
        ctrl.form   = null;
        ctrl.data   = {};

        schema.on("value", function(snap) {
            ctrl.schema = snap.val();
            ctrl.schema.key = snap.key();

            m.redraw();
        });

        // No sense doing any work if we don't have an id to operate on
        if(!id) {
            return;
        }

        // On updates from firebase we need to merge in fields carefully
        ref.on("value", function(snap) {
            var data = snap.val();
            
            // Don't try to grab non-existent data
            if(!snap.exists()) {
                return m.route("/content/" + m.route.param("schema"));
            }

            ctrl.data = assign(data, {
                fields : merge(data.fields, ctrl.data.fields)
            });

            m.redraw();
        });

        watch(ref);
    },

    view : function(ctrl) {
        var title;
        
        if(!ctrl.schema) {
            return m.component(layout);
        }
        
        title = capitalize(get(ctrl.data, "name")) + " | " + capitalize(ctrl.schema.name);
        
        if(!ctrl.id) {
            return m.component(layout, {
                title   : title,
                content : [
                    m.component(nav),
                    m("div", { class : css.empty },
                        m("p", "Select an entry from the list")
                    )
                ]
            });
        }

        return m.component(layout, {
            title   : title,
            content : [
                m.component(nav),
                m("div", { class : css.content },
                    m("div", { class : css.head },
                        m("div", { class : css.actions },
                            m.component(publishing, {
                                ref     : ctrl.ref,
                                data    : ctrl.data,
                                class   : css.publishing,
                                enabled : ctrl.form && ctrl.form.checkValidity()
                            }),
                            m("div", { class : css.previewing },
                                m("button", {
                                        class  : css.preview,
                                        title  : "Preview",
                                        href   : ctrl.schema.preview + ctrl.id,
                                        target : "_blank"
                                    },
                                    m("svg", { class : css.previewIcon },
                                        m("use", { href : "/src/icons.svg#icon-preview" })
                                    ),
                                    "Preview"
                                )
                            )
                        )
                    ),
                    m("div", { class : css.body },
                        m("h2", { class : css.schema }, "/" + ctrl.schema.name + "/"),
                        m("h1", {
                                // Attrs
                                class           : css.title,
                                contenteditable : true,
                                
                                // Events
                                oninput : m.withAttr("innerText", update(ctrl.ref, ctrl.data, [ "name" ]))
                            },
                            ctrl.data.name || ""
                        ),
                        m("form", {
                                class  : css.form,
                                config : function(el, init) {
                                    if(init) {
                                        return;
                                    }

                                    ctrl.form = el;

                                    // force a redraw so publishing component can get
                                    // new args w/ actual validity
                                    m.redraw();
                                }
                            },
                            m.component(children, {
                                data : ctrl.data.fields || {},

                                // TODO: Change to "fields"?
                                details : ctrl.schema.fields,
                                path    : [ "fields" ],
                                root    : ctrl.ref,
                                state   : ctrl.data.fields,
                                update  : update.bind(null, ctrl.ref, ctrl.data)
                            })
                        )
                    )
                )
            ]
        });
    }
};
