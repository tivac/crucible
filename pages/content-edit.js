"use strict";

var m = require("mithril"),
    moment = require("moment"),

    children = require("../types/children"),
    db       = require("../lib/firebase"),
    update   = require("../lib/update"),

    publish;

publish = {
    controller : function(options) {
        var ctrl = this;

        ctrl.now  = moment();
        ctrl.date = false;

        ctrl.publish = function(e) {
            options.ref.child("_published").set(moment().subtract(10, "seconds").valueOf());
        };

        ctrl.publishAt = function(e) {
            if(!ctrl.date || !ctrl.date.isValid()) {
                return console.error("Invalid date"); // TODO: Really Handle
            }

            options.ref.child("_published").set(ctrl.date.valueOf());
        };

        ctrl.unpublish = function(e) {
            options.ref.child("_published").remove();
        };
    },

    view : function(ctrl, options) {
        var published = options.data._published && moment(options.data._published);

        if(published) {
            return m("div",
                m("span",
                    published.isBefore(ctrl.now) ?
                        "Published at " + published.format("lll") :
                        "Publishing at " + published.format("lll")
                ),
                m("button", {
                    onclick : ctrl.unpublish
                }, "Unpublish")
            );
        }
        
        return m("div",
            m("button", {
                onclick : ctrl.publish
            }, "Publish Now"),
            " | ",
            m("label",
                "Publish at: ",
                m("input", {
                    type    : "datetime-local",
                    value   : (ctrl.date || ctrl.now).format("YYYY-MM-DD[T]HH:mm"),
                    oninput : m.withAttr("value", function(value) {
                        ctrl.date = moment(value, "YYYY-MM-DD[T]HH:mm");
                    })
                })
            ),
            m("button", {
                onclick : ctrl.publishAt
            }, "Publish")
        );
    }
};

module.exports = {
    controller : function() {
        var ctrl = this,
            
            entry  = db.child("content/" + m.route.param("id")),
            schema = db.child("schemas/" + m.route.param("schema"));
        
        ctrl.ref    = entry;
        ctrl.entry  = null;
        ctrl.schema = null;
        
        entry.on("value", function(snap) {
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
        entry.on("child_changed", function(snap) {
            if(snap.key() === "updated") {
                return;
            }

            entry.child("updated").set(db.TIMESTAMP);
        });
    },

    view : function(ctrl) {
        if(!ctrl.entry || !ctrl.schema) {
            return m("h1", "LOADING...");
        }

        return [
            m("h1", "Content - Editing \"" + (ctrl.entry._name || "") + "\""),
            
            m("div",
                m("label",
                    "Type: ",
                    m("a", { href : "/schemas/" + ctrl.entry._schema, config : m.route }, ctrl.schema.name)
                )
            ),
            m.component(publish, {
                ref  : ctrl.ref,
                data : ctrl.entry
            }),
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
            m.component(children, {
                details : ctrl.schema.fields,
                ref     : ctrl.ref,
                data    : ctrl.entry,
                root    : ctrl.ref
            }),
            m("hr"),
            m.component(publish, {
                ref  : ctrl.ref,
                data : ctrl.entry
            })
        ];
    }
};
