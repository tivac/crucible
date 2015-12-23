"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase"),

    nav = require("./nav"),

    size = 20;

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.content = {};
        ctrl.offset  = 0;

        db.child("schemas").on("value", function(snap) {
            ctrl.schemas = snap.val() || {};

            snap.forEach(function(schema) {
                var key = schema.key();

                db.child("content/" + key).startAt(ctrl.offset).endAt(size).once("value", function(content) {
                    ctrl.content[key] = [];

                    content.forEach(function(record) {
                        var data = record.val();

                        data.key = record.key();

                        ctrl.content[key].push(data);
                    });

                    m.redraw();
                });
            });

            m.redraw();
        });

        ctrl.add = function(schema) {
            var result = db.child("content/" + schema).push({
                    _name    : "New " + ctrl.schemas[schema].name,
                    _created : db.TIMESTAMP
                });

            m.route("/content/" + schema + "/" + result.key());
        };

        ctrl.data = function() {

        };
    },

    view : function(ctrl) {
        console.log(ctrl.content); // TODO: REMOVE DEBUGGING

        return [
            m.component(nav),
            m("h1", "CONTENT"),
            Object.keys(ctrl.schemas || {}).map(function(schemaKey) {
                var schema = ctrl.schemas[schemaKey];

                return m("div",
                    m("h2", schema.name),
                    m("p",
                        m("button", { onclick : ctrl.add.bind(ctrl, schemaKey) }, "Add " + schema.name)
                    ),
                    m("table",
                        m("tr",
                            m("th", "Name"),
                            m("th", "Created"),
                            m("th", "Updated"),
                            m("th", m.trust("&nbsp;"))
                        ),
                        ctrl.content[schemaKey] ?
                            ctrl.content[schemaKey].map(function(data) {
                                return m("tr", { key : data.key },
                                    m("td",
                                        m("a", { href : "/content/" + schemaKey + "/" + data.key, config : m.route }, data._name)
                                    ),
                                    m("td", data._created),
                                    m("td", data._updated),
                                    m("td",
                                        m("button", "Delete")
                                    )
                                );
                            }) :
                            null
                    )
                );
            })
        ];
    }
};
