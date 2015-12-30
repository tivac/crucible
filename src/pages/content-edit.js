"use strict";

var m = require("mithril"),

    children   = require("../types/children"),
    db         = require("../lib/firebase"),
    update     = require("../lib/update"),
    
    layout = require("./layout"),
    
    publishing = require("./content-edit/publishing"),
    versioning = require("./content-edit/versioning"),

    css = require("./content-edit.css");

module.exports = {
    controller : function() {
        var ctrl = this,
            
            ref    = db.child("content/" + m.route.param("schema") + "/" + m.route.param("id")),
            schema = db.child("schemas/" + m.route.param("schema"));
        
        ctrl.ref    = ref;
        ctrl.entry  = null;
        ctrl.schema = null;
        ctrl.form   = null;
        
        ref.on("value", function(snap) {
            if(!snap.exists()) {
                return m.route("/content");
            }

            ctrl.entry = snap.val();

            if(!ctrl.entry.data) {
                ctrl.entry.data = {};
            }
            
            m.redraw();
        });
        
        schema.on("value", function(snap) {
            ctrl.schema = snap.val();

            m.redraw();
        });

        // Ensure the updated timestamp is always accurate-ish
        ref.on("child_changed", function(snap) {
            if(snap.key() === "updated") {
                return;
            }

            ref.child("updated").set(db.TIMESTAMP);
        });
    },

    view : function(ctrl) {
        if(!ctrl.entry || !ctrl.schema) {
            return m.component(layout);
        }

        return m.component(layout, {
            title   : ctrl.entry._name,
            content : [
                m("h1", { class : css.title },
                    ctrl.schema.name + " / ",
                    m("span", {
                            contenteditable : true,
                        
                            oninput : m.withAttr("innerText", update.bind(null, ctrl.ref, "_name"))
                        },
                        ctrl.entry._name || ""
                    )
                ),
                m("div", { class : css.menu },
                    m.component(publishing, {
                        ref     : ctrl.ref,
                        data    : ctrl.entry,
                        class   : css.publishing,
                        enabled : ctrl.form && ctrl.form.checkValidity()
                    }),
                    m.component(versioning, {
                        ref   : ctrl.ref,
                        data  : ctrl.entry,
                        class : css.version
                    })
                ),
                m("form", {
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
                        ref     : ctrl.ref,
                        data    : ctrl.entry,
                        root    : ctrl.ref
                    })
                )
            ]
        });
    }
};
