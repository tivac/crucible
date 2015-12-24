"use strict";

var m        = require("mithril"),
    paginate = require("paginationator"),
    moment   = require("moment"),
    fuzzy    = require("fuzzysearch"),
    debounce = require("lodash.debounce"),
    sluggo   = require("sluggo"),
    
    db = require("../../lib/firebase"),

    css = require("./listings.css"),

    size = 20;

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.schema = options.schema;

        ctrl.page = 0;

        ctrl.entries = null;
        ctrl.content = null;
        ctrl.results = null;
        
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
                data.search  = sluggo(data._name, { separator : "" });

                entries.push(data);
            });

            ctrl.entries = entries;
            ctrl.content = paginate(entries, { limit : size });

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

        // m.redraw calls are necessary due to debouncing, this function
        // may not be executing during a planned redraw cycle
        ctrl.filter = debounce(function(input, e) {
            if(input.length < 2) {
                ctrl.results = false;

                return m.redraw();
            }

            input = input.toLowerCase();

            ctrl.results = ctrl.entries.filter(function(content) {
                return fuzzy(input, content.search);
            }).slice(0, size);

            m.redraw();
        }, 100);
    },

    view : function(ctrl) {
        var pages = [],
            current;

        if(ctrl.results) {
            current = {
                items : ctrl.results
            };
        } else {
            current = ctrl.content ? ctrl.content.pages[ctrl.page] : { items : [] };
        }

        if(ctrl.content && !ctrl.results) {
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
            m("div", { class : css.meta },
                m("h2", { class : css.title }, ctrl.schema.name),

                m("div", { class : css.new },
                    m("button", { onclick : ctrl.add }, "Add " + ctrl.schema.name)
                ),

                m("div", { class : css.filter },
                    m("input", { class : css.search, oninput : m.withAttr("value", ctrl.filter), placeholder : "Search" })
                )
            ),
            m("table", { class : css.table },
                m("thead",
                    m("tr",
                        m("th", { class : css.nonNumeric }, "Name"),
                        m("th", { class : css.nonNumeric }, "Created"),
                        m("th", { class : css.nonNumeric }, "Updated"),
                        m("th", { class : css.nonNumeric }, "")
                    )
                ),
                m("tbody",
                    current.items.map(function(data) {
                        return m("tr", { key : data.key },
                            m("td", { class : css.nonNumeric },
                                m("a", { href : "/content/" + ctrl.schema.key + "/" + data.key, config : m.route }, data._name)
                            ),
                            m("td", { class : css.nonNumeric, title : data.created.format("LLL") }, data.created.fromNow()),
                            m("td", { class : css.nonNumeric, title : data.updated.format("LLL") }, data.updated.fromNow()),
                            m("td", { class : css.nonNumeric },
                                m("button", { class : css.delete }, "Delete")
                            )
                        );
                    })
                )
            ),
            pages.length ?
                m("div", { class : css.pagination },
                    current.prev ?
                        m("a", {
                            key     : "prev",
                            href    : "#/page" + current.prev - 1,
                            class   : css.link,
                            onclick : ctrl.change.bind(null, current.prev - 1)
                        }, m.trust("&lt; ")) :
                        m("span", { class : css.link }, m.trust("&lt;")),
                    pages.map(function(page) {
                        if(typeof page === "string") {
                            return m("span", { class : css.link }, page);
                        }

                        if(page.idx === current.idx) {
                            return m("span", { class : css.link }, page.current);
                        }

                        return m("a", {
                            key     : "page" + page.idx,
                            href    : "#/page" + page.idx,
                            class   : css.link,
                            onclick : ctrl.change.bind(null, page.idx)
                        }, page.current);
                    }),
                    current.next ?
                        m("a", {
                            key     : "next",
                            href    : "#/page" + current.next - 1,
                            class   : css.link,
                            onclick : ctrl.change.bind(null, current.next - 1)
                        }, m.trust("&gt;")) :
                        m("span", { class : css.link }, m.trust("&gt;"))
                ) :
                null
        );
    }
};
