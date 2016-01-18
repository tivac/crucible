"use strict";

var m = require("mithril"),

    children = require("../types/children"),
    db       = require("../lib/firebase"),
    update   = require("../lib/update"),
    watch    = require("../lib/watch"),

    layout = require("./layout"),
    nav    = require("./content/nav"),

    publishing = require("./content-edit/publishing"),
    versioning = require("./content-edit/versioning"),

    css = require("./content-edit.css");

module.exports = {
    controller : function() {
        var ctrl = this,
            ref    = db.child("content/" + m.route.param("schema") + "/" + m.route.param("id")),
            schema = db.child("schemas/" + m.route.param("schema"));

        ctrl.ref    = ref;
        ctrl.data   = null;
        ctrl.schema = null;
        ctrl.form   = null;

        ref.on("value", function(snap) {
            if(!snap.exists()) {
                return m.route("/content");
            }

            ctrl.data = snap.val();

            m.redraw();
        });

        schema.on("value", function(snap) {
            ctrl.schema = snap.val();
            ctrl.schema.key = snap.key();

            m.redraw();
        });

        watch(ref);
    },

    view : function(ctrl) {
        if(!ctrl.data || !ctrl.schema) {
            return m.component(layout);
        }

        return m.component(layout, {
            title : ctrl.data.name,

            nav : m.component(nav, { schema : ctrl.schema }),

            content : [
                m(".head", { class : css.menu },
                    m.component(publishing, {
                        ref     : ctrl.ref,
                        data    : ctrl.data,
                        class   : css.publishing,
                        enabled : ctrl.form && ctrl.form.checkValidity()
                    }),
                    m.component(versioning, {
                        ref   : ctrl.ref,
                        data  : ctrl.data,
                        class : css.version
                    })
                ),
                m(".body", { class : css.body },
                    m("h2", { class : css.schema }, m.trust("/"), ctrl.schema.name, m.trust("/")),
                    m("h1", {
                            class : css.title,
                            contenteditable : true,
                            oninput : m.withAttr("innerText", update.bind(null, ctrl.ref, "name"))
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
                            details : ctrl.schema.fields,
                            ref     : ctrl.ref.child("fields"),
                            data    : ctrl.data.fields || {},
                            root    : ctrl.ref
                        })
                    )
                )
            ]
        });
    }
};
