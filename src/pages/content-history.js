"use strict";

var m      = require("mithril"),
    moment = require("moment"),

    db = require("../lib/firebase"),

    layout = require("./layout"),
    css    = require("./content-history.css");

module.exports = {
    controller : function() {
        var ctrl   = this,

            schema = m.route.param("schema"),
            id     = m.route.param("id"),

            content  = db.child("content/" + schema + "/" + id),
            versions = db.child("versions/" + id),

            current;

        ctrl.versions = null;

        content.on("value", function(snap) {
            var data = snap.val();

            data.updated = moment.utc(data.updated);
            data.version = "Current";

            current = data;
        });

        versions.on("value", function(snap) {
            ctrl.versions = [];

            snap.forEach(function(ver) {
                var data = ver.val();

                data.version = ver.key();
                data.updated = moment.utc(data.updated);

                data.restorable = true;

                ctrl.versions.push(data);
            });

            ctrl.versions.reverse();

            ctrl.versions.unshift(current);

            m.redraw();
        });

        // Event handlers
        ctrl.restore = function(version) {
            content.once("value", function(prev) {
                var data = prev.exportVal(),
                    rev  = data.version || 1;

                versions.child(rev).set(data);

                versions.child(version).once("value", function(next) {
                    var out = next.exportVal();

                    out.version = rev + 1;

                    content.set(out);
                });
            });
        };
    },

    view : function(ctrl) {
        var url = m.route();

        if(!ctrl.versions) {
            return m.component(layout);
        }

        return m.component(layout, {
            title   : ctrl.versions[0].name,
            content : m("div",
                m("h1", "History for: " + ctrl.versions[0].name),
                m("table", { class : css.table },
                    m("colgroup",
                        m("col", { class : css.namecol }),
                        m("col", { class : css.datecol }),
                        m("col", { class : css.metacol })
                    ),
                    m("thead",
                        m("tr",
                            m("th", "Version"),
                            m("th", "Last Updated"),
                            m("th")
                        )
                    ),
                    m("tbody",
                        ctrl.versions.map(function(data) {
                            return m("tr",
                                m("td", data.version),
                                m("td", { title : data.updated.format("LLL") }, data.updated.fromNow()),
                                m("td",
                                    m("div", { class : css.actions },
                                        m("a", {
                                                title  : "Preview",
                                                href   : m.route() + "/" + data.version,
                                                config : m.route
                                            },
                                            m("svg", { class : css.preview },
                                                m("use", { href : "/src/icons.svg#icon-preview" })
                                            )
                                        ),

                                        data.restorable ?
                                            m("button", {
                                                    class   : css.restore,
                                                    onclick : ctrl.restore.bind(ctrl, data.version)
                                                },
                                                m("svg", { class : css.restoreIcon },
                                                    m("use", { href : "/src/icons.svg#icon-restore" })
                                                )
                                            ) :
                                            null
                                    )
                                )
                            );
                        })
                    )
                )
            )
        });
    }
};
