"use strict";

var m = require("mithril"),

    children   = require("../types/children"),
    db         = require("../lib/firebase"),
    update     = require("../lib/update"),
    
    nav = require("./nav"),
    
    publishing = require("./content/publishing"),
    versioning = require("./content/versioning"),

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
        var publish,
            version;

        if(!ctrl.entry || !ctrl.schema) {
            return m("h1", "LOADING...");
        }

        publish = m.component(publishing, {
            ref     : ctrl.ref,
            data    : ctrl.entry,
            class   : css.child,
            enabled : ctrl.form && ctrl.form.checkValidity()
        });

        version = m.component(versioning, {
            ref   : ctrl.ref,
            data  : ctrl.entry,
            class : css.child
        });

        return [
            m.component(nav),
            m("h1", "Content - Editing \"" + (ctrl.entry._name || "") + "\""),
            
            m("div",
                m("label",
                    "Type: ",
                    m("a", { href : "/schemas/" + ctrl.entry._schema, config : m.route }, ctrl.schema.name)
                )
            ),
            m("div", { class : css.menu },
                publish,
                version
            ),
            m("hr"),
            m("div",
                m("label",
                    "Name: ",
                    m("input", {
                        value   : ctrl.entry._name || "",
                        oninput : m.withAttr("value", update.bind(null, ctrl.ref, "_name")),
                        config  : function(el, init) {
                            if(init) {
                                return;
                            }

                            el.select();
                        }
                    })
                )
            ),
            m("br"),
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
            ),
            m("hr"),
            m("div", { class : css.menu },
                publish,
                version
            )
        ];
    }
};
