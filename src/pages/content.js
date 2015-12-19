"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase"),

    nav = require("./nav");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.content = {};

        db.child("schemas").on("value", function(snap) {
            ctrl.schemas = snap.val() || {};

            snap.forEach(function(schema) {
                db.child("content").orderByChild("_schema").equalTo(schema.key()).on("value", function(content) {
                    ctrl.content[schema.key()] = content.val();

                    m.redraw();
                });
            });

            m.redraw();
        });

        ctrl.add = function(schema) {
            var result = db.child("content").push({
                    _schema : schema,
                    _name   : "New " + ctrl.schemas[schema].name
                });

            m.route("/content/" + schema + "/" + result.key());
        };
    },

    view : function(ctrl) {
        return [
            m(nav),
            m("h1", "CONTENT"),
            Object.keys(ctrl.schemas || {}).map(function(schemaKey) {
                var schema = ctrl.schemas[schemaKey];

                return m("div",
                    m("h2", schema.name),
                    m("p",
                        m("button", { onclick : ctrl.add.bind(ctrl, schemaKey) }, "Add " + schema.name)
                    ),
                    m("ul",
                        Object.keys(ctrl.content[schemaKey] || {}).map(function(contentKey) {
                            var content = ctrl.content[schemaKey][contentKey];

                            return m("li",
                                m("a", { href : "/content/" + schemaKey + "/" + contentKey, config : m.route }, content._name)
                            );
                        })
                    )
                );
            })
        ];
    }
};
