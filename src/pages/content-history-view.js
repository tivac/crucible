"use strict";

var m = require("mithril"),

    children = require("../types/children"),
    db       = require("../lib/firebase"),

    capitalize = require("../lib/capitalize"),

    layout = require("./layout"),

    css = require("./content-edit.css");

module.exports = {
    controller : function() {
        var ctrl    = this,
            schema  = m.route.param("schema"),
            id      = m.route.param("id"),
            version = m.route.param("version"),

            ref;

        ctrl.data   = null;
        ctrl.schema = null;

        if(version === "Current") {
            ref = db.child("content/" + schema + "/" + id);
        } else {
            ref = db.child("versions/" + id + "/" + version);
        }

        ref.on("value", function(snap) {
            if(!snap.exists()) {
                return m.route("/content/" + schema + "/" + id + "/history");
            }

            ctrl.data = snap.val();

            m.redraw();
        });

        db.child("schemas/" + schema).on("value", function(snap) {
            ctrl.schema = snap.val();

            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.data || !ctrl.schema) {
            return m.component(layout);
        }

        return m.component(layout, {
            title   : capitalize(ctrl.data.name),
            content : [
                m("h1", { class : css.heading },
                    m("span", { class : css.schema }, ctrl.schema.name, m.trust("&nbsp;/&nbsp;")),
                    m("span", { class : css.title }, ctrl.data.name || "")
                ),
                m("form", { class  : css.form },
                    m.component(children, {
                        details : ctrl.schema.fields,
                        data    : ctrl.data.fields || {}
                    })
                )
            ]
        });
    }
};
