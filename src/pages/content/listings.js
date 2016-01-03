"use strict";

var m        = require("mithril"),
    paginate = require("paginationator"),
    moment   = require("moment"),
    fuzzy    = require("fuzzysearch"),
    debounce = require("lodash.debounce"),
    slug     = require("sluggo"),
    
    db = require("../../lib/firebase"),
    
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
                
                ctrl.pagination();
                
                m.redraw();
            });
        };
        
        ctrl.pagination = function() {
            ctrl.content = paginate(ctrl.entries, { limit : size });
        };
        
        // Go get initial data
        ctrl.fetch();

        // Event handlers
        ctrl.add = function() {
            var result;
                
            result = db.child("content/" + ctrl.schema.key).push({
                name    : "New " + ctrl.schema.name,
                created : db.TIMESTAMP
            });

            m.route("/content/" + ctrl.schema.key + "/" + result.key());
        };

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
        
        ctrl.visit = function(url, e) {
            e.preventDefault();
            
            m.route(url);
        };
        
        ctrl.sort = function(field) {
            if(field === ctrl.sorting.field) {
                ctrl.sorting.desc = !ctrl.sorting.desc;
                
                ctrl.entries.reverse();
                                
                return ctrl.pagination();
            }
            
            ctrl.sorting.field = field;
            ctrl.sorting.desc  = field !== "name";
            
            ctrl.content = [];
            
            ctrl.fetch();
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
            m("div", { class : css.metas },
                m("div", { class : css.addMeta },
                    m("button", {
                            onclick : ctrl.add,
                            class   : css.add
                        },
                        "Add " + ctrl.schema.name
                    )
                ),
                m("div", { class : css.searchMeta },
                    m("input", {
                        class       : css.search,
                        placeholder : "Filter this content",
                        
                        oninput     : m.withAttr("value", ctrl.filter)
                    })
                ),
                m("div", { class : css.editMeta },
                    m("a", {
                            class : css.edit,
                            
                            href   : m.route() + "/edit",
                            config : m.route
                        },
                        "Edit"
                    )
                )
            ),
            m("table", { class : css.table },
                m("colgroup",
                    m("col", { class : css.namecol }),
                    m("col", { class : css.datecol }),
                    m("col", { class : css.datecol }),
                    m("col", { class : css.deletecol })
                ),
                m("thead",
                    m("tr",
                        m("th", { onclick : ctrl.sort.bind(ctrl, "name") }, "Name"),
                        m("th", { onclick : ctrl.sort.bind(ctrl, "created") }, "Created"),
                        m("th", { onclick : ctrl.sort.bind(ctrl, "updated") }, "Updated"),
                        m("th", "")
                    )
                ),
                m("tbody",
                    current.items.map(function(data) {
                        var url = "/content/" + ctrl.schema.key + "/" + data.key;
                        
                        return m("tr", { key : data.key },
                            m("td", { onclick : ctrl.visit.bind(ctrl, url) },
                                m("a", { href : url, config : m.route }, data.name)
                            ),
                            m("td", { title : data.created.format("LLL") }, data.created.fromNow()),
                            m("td", { title : data.updated.format("LLL") }, data.updated.fromNow()),
                            m("td",
                                m("button", { class : css.remove }, "Delete")
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
                            href    : "#/page" + (current.prev - 1),
                            class   : css.arrowLeft,
                            onclick : ctrl.change.bind(null, current.prev - 1)
                        }, "") :
                        m("span", { class : css.disabledArrowLeft }, ""),
                    
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
                                class   : css.arrowRight,
                                onclick : ctrl.change.bind(null, current.next - 1)
                            },
                            ""
                        ) :
                        m("span", { class : css.disabledArrowRight }, "")
                ) :
                null
        );
    }
};
