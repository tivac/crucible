"use strict";

var m        = require("mithril"),
    paginate = require("paginationator"),
    moment   = require("moment"),
    fuzzy    = require("fuzzysearch"),
    debounce = require("lodash.debounce"),
    slug     = require("sluggo"),

    db     = require("../../lib/firebase"),
    remove = require("../../lib/remove"),

    css = require("./listings.css"),

    size = 10;

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.schema = options.schema;

        ctrl.page = 0;

        ctrl.entries = null;
        ctrl.content = null;
        ctrl.results = null;

        ctrl.sorting = {
            field : "updated",
            desc  : true
        };

        ctrl.fetch = function() {
            db.child("content/" + ctrl.schema.key).orderByChild(ctrl.sorting.field).on("value", function(snap) {
                var entries = [];

                snap.forEach(function(record) {
                    var data = record.val();

                    data.key = record.key();
                    data._updated = data.updated;
                    data.created = moment.utc(data.created);
                    data.updated = moment.utc(data.updated);
                    data.search  = slug(data.name, { separator : "" });

                    entries.push(data);
                });

                ctrl.entries = entries;

                if(ctrl.sorting.desc) {
                    ctrl.entries.reverse();
                }

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

        ctrl.sort = function(field) {
            if(field === ctrl.sorting.field) {
                ctrl.sorting.desc = !ctrl.sorting.desc;

                ctrl.entries.reverse();

                return ctrl._paginate();
            }

            ctrl.sorting.field = field;
            ctrl.sorting.desc  = field !== "name";

            ctrl.content = [];

            ctrl.fetch();
        };

        ctrl.remove = function(data) {
            var ref = db.child("content").child(ctrl.schema.key).child(data.key);

            if(window.confirm("Remove " + data.name + "?")) {
                ref.once("value", function(snap) {
                    var data = snap.exportVal(),
                        rev  = data.version || 1,
                        dest = db.child("versions").child(snap.key()).child(rev);

                    dest.set(data);

                    remove(ref, function(error) {
                        if(error) {
                            console.error(error);
                        } else {
                            ctrl.fetch();
                        }
                    });
                });
            }
        };
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
            m("table", { class : css.table },
                m("colgroup",
                    m("col", { class : css.namecol }),
                    m("col", { class : css.datecol }),
                    m("col", { class : css.datecol }),
                    m("col", { class : css.metacol })
                ),
                m("thead",
                    m("tr",
                        [ "Name", "Created", "Updated" ].map(function(title) {
                            var field = title.toLowerCase();

                            return m("th", {
                                    onclick : ctrl.sort.bind(ctrl, field),
                                    class   : css.th
                                },
                                title,
                                ctrl.sorting.field === field ?
                                    m("svg", { class : css[ctrl.sorting.desc ? "desc" : "asc"] },
                                        m("use", { href : "/src/icons.svg#icon-arrow" })
                                    ) :
                                    null
                            );
                        }),

                        m("th", "")
                    )
                ),
                m("tbody",
                    current.items.map(function(data) {
                        var url = "/content/" + ctrl.schema.key + "/" + data.key;

                        return m("tr", { key : data.key },
                            m("td",
                                m("a", { href : url, config : m.route }, data.name)
                            ),
                            m("td", { title : data.created.format("LLL") }, data.created.fromNow()),
                            m("td", { title : data.updated.format("LLL") }, data.updated.fromNow()),
                            m("td",
                                m("div", { class : css.actions },
                                    m("a", {
                                            title  : "Edit",
                                            href   : url,
                                            config : m.route
                                        },
                                        m("svg", { class : css.edit },
                                            m("use", { href : "/src/icons.svg#icon-edit" })
                                        )
                                    ),
                                    m("a", {
                                            title  : "Preview",
                                            href   : ctrl.schema.preview + data.key,
                                            target : "_blank"
                                        },
                                        m("svg", { class : css.preview },
                                            m("use", { href : "/src/icons.svg#icon-preview" })
                                        )
                                    ),
                                    m("button", {
                                            class : css.remove,
                                            title : "Remove",

                                            onclick : ctrl.remove.bind(ctrl, data)
                                        },
                                        m("svg", { class : css.removeIcon },
                                            m("use", { href : "/src/icons.svg#icon-remove" })
                                        )
                                    )
                                )
                            )
                        );
                    })
                )
            ),
            m("div", { class : css.nav },
                m("div", { class : css.pagination },
                    current.prev ?
                        m("a", {
                                key     : "prev",
                                href    : "#/page" + (current.prev - 1),
                                class   : css.pager,
                                onclick : ctrl.change.bind(null, current.prev - 1)
                            },
                            m("svg", { class : css.prevIcon },
                                m("use", { href : "/src/icons.svg#icon-arrow" })
                            )
                        ) :
                        m("span", { class : css.pagerOff },
                            m("svg", { class : css.prevIcon },
                                m("use", { href : "/src/icons.svg#icon-arrow" })
                            )
                        ),

                    pages.map(function(page) {
                        if(typeof page === "string") {
                            return m("span", { class : css.disabled }, page);
                        }

                        if(page.idx === current.idx) {
                            return m("span", { class : css.disabled }, page.current);
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
                                href    : "#/page" + (current.next - 1),
                                class   : css.pager,
                                onclick : ctrl.change.bind(null, current.next - 1)
                            },
                            m("svg", { class : css.nextIcon },
                                m("use", { href : "/src/icons.svg#icon-arrow" })
                            )
                        ) :
                        m("span", { class : css.pagerOff },
                            m("svg", { class : css.nextIcon },
                                m("use", { href : "/src/icons.svg#icon-arrow" })
                            )
                        )
                ),
                m("div", { class : css.searching },
                    m("input", {
                        class       : css.search,
                        placeholder : "Filter this content",

                        oninput     : m.withAttr("value", ctrl.filter)
                    })
                )
            )
        );
    }
};
