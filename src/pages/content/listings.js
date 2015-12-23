"use strict";

var m        = require("mithril"),
    paginate = require("paginationator"),
    moment   = require("moment"),
    
    db = require("../../lib/firebase");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.schema = options.schema;

        ctrl.page = 0;

        ctrl.content = null;
        
        // need to go get schema name
        db.child("schemas/" + ctrl.schema.key).once("value", function(snap) {
            ctrl.schema.name = snap.val().name;
        });

        db.child("content/" + ctrl.schema.key).on("value", function(snap) {
            var entries = [];

            snap.forEach(function(record) {
                var data = record.val();

                data.key = record.key();
                data.created = moment(data._created);
                data.updated = moment(data._updated);

                entries.push(data);
            });

            ctrl.content = paginate(entries, { limit : 20 });

            m.redraw();
        });

        ctrl.add = function() {
            var result;
                
            result = db.child("content/" + ctrl.schema.key).push({
                _name    : "New " + ctrl.schema.name,
                _created : db.TIMESTAMP
            });

            m.route("/content/" + ctrl.schema.key + "/" + result.key());
        };

        ctrl.change = function(page, e) {
            e.preventDefault();

            ctrl.page = page;
        };
    },

    view : function(ctrl) {
        var current = ctrl.content ? ctrl.content.pages[ctrl.page] : { items : [] },
            pages   = [];

        if(ctrl.content) {
            if(ctrl.content.pages.length > 15) {
                if(current.idx > 5) {
                    pages.push("...");
                }

                pages = pages.concat(ctrl.content.pages.slice(
                    Math.max(current.idx - 5, 0),
                    Math.min(current.idx + 5, ctrl.content.pages.length)
                ));

                if(current.idx < (ctrl.content.pages.length - 5)) {
                    pages.push("...");
                }
            } else {
                pages = ctrl.content.pages;
            }
        }

        return m("div",
            m("h2", ctrl.schema.name),
            m("p",
                m("button", { onclick : ctrl.add }, "Add " + ctrl.schema.name)
            ),
            m("table",
                m("tr",
                    m("th", "Name"),
                    m("th", "Created"),
                    m("th", "Updated"),
                    m("th", m.trust("&nbsp;"))
                ),
                current.items.map(function(data) {
                    return m("tr", { key : data.key },
                        m("td",
                            m("a", { href : "/content/" + ctrl.schema.key + "/" + data.key, config : m.route }, data._name)
                        ),
                        m("td", { title : data.created.format("LLL") }, data.created.fromNow()),
                        m("td", { title : data.updated.format("LLL") }, data.updated.fromNow()),
                        m("td",
                            m("button", "Delete")
                        )
                    );
                })
            ),
            ctrl.content ?
                m("div",
                    current.prev ?
                        m("a", {
                            href : "#/page" + current.prev - 1,
                            onclick : ctrl.change.bind(null, current.prev - 1)
                        }, m.trust("&lt; "), current.prev) :
                        m.trust("&lt; &nbsp;"),
                    pages.map(function(page) {
                        if(typeof page === "string") {
                            return m.trust(page);
                        }

                        if(page.idx === current.idx) {
                            return page.current;
                        }

                        return m("a", {
                            href : "#/page" + page.idx,
                            onclick : ctrl.change.bind(null, page.idx)
                        }, page.current);
                    }),
                    current.next ?
                        m("a", {
                            href : "#/page" + current.next - 1,
                            onclick : ctrl.change.bind(null, current.next - 1)
                        }, current.next, m.trust("&gt;")) :
                        m.trust("&nbsp; &gt;")
                ) :
                null
        );
    }
};
