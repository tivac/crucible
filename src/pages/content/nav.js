"use strict";

var m        = require("mithril"),
    paginate = require("paginationator"),
    moment   = require("moment"),
    fuzzy    = require("fuzzysearch"),
    debounce = require("lodash.debounce"),
    get      = require("lodash.get"),
    slug     = require("sluggo"),

    db = require("../../lib/firebase"),

    css = require("./nav.css"),

    size = 30;

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.schema = options.schema;

        ctrl.page = 0;

        ctrl.entries = null;
        ctrl.content = null;
        ctrl.results = null;

        ctrl.fetch = function() {
            db.child("content/" + ctrl.schema.key).orderByChild("published").on("value", function(snap) {
                var entries = [];

                snap.forEach(function(record) {
                    var data = record.val();

                    data.key = record.key();
                    data._updated = data.updated;
                    data.created = moment.utc(data.created);
                    data.updated = moment.utc(data.updated);
                    data.published = data.published ? moment.utc(data.published) : null;
                    data.excerpt = get(data, "fields.tabs.en.excerpt", null) || get(data, "fields.tabs.en.title", null);
                    data.search  = slug(data.name, { separator : "" });

                    entries.push(data);
                });

                ctrl.entries = entries;

                ctrl._paginate();

                m.redraw();
            });
        };

        ctrl._paginate = function() {
            if(!ctrl.entries.length) {
                return;
            }

            ctrl.content = paginate(ctrl.entries, { limit : size });
        };

        // Go get initial data
        ctrl.fetch();

        ctrl.change = function(page, e) {
            e.preventDefault();

            ctrl.page = page;
        };

        // m.redraw calls are necessary due to debouncing, this function
        // may not be executing during a planned redraw cycle
        ctrl.filter = debounce(function(input) {
            if(input.length < 2) {
                ctrl.results = false;

                return m.redraw();
            }

            input = slug(input);

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
            // Add leading or trailing "..." to indicate that we aren't
            // showing all possible pages
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
            m("div", { class : css.filter },
                m("input", {
                    class       : css.text,
                    placeholder : "search",
                    oninput     : m.withAttr("value", ctrl.filter)
                })
            ),
            m("ul", { class : css.list },
                current.items.map(function(data) {
                    var date = data.published ?
                        "published: " + data.published.format("L") :
                        "updated: " + data.updated.format("L");

                    return m("li", { class : data.published ? css.published : css.item },
                        m("a", {
                            class  : css.anchor,
                            href   : "/content/" + ctrl.schema.key + "/" + data.key,
                            config : m.route
                        },
                            m("h3", { class : css.heading }, data.name),
                            m("p", { class : css.date }, date),
                            m("p", { class : css.excerpt }, data.excerpt)
                        )
                    );
                })
            )
        );
    }
};
