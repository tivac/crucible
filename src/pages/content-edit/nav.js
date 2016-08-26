import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import fuzzy from "fuzzysearch";
import clamp from "lodash.clamp";
import debounce from "lodash.debounce";
import slug from "sluggo";

import config, { icons } from "../../config.js";

import db from "../../lib/firebase.js";
import prefix from "../../lib/prefix.js";
import name from "./name.js";

import css from "./nav.css";

var dateFormat = "MM/DD/YYYY",
    pg;


var PageState = function() {    
    var MIN_PAGE = 1;

    this.page     = 1;
    this.itemsPer = 5;

    this.limits = [
        NaN, // Pad with a NaN so our indexes match page number
        Date.now()
    ];

    this.numPages = function() {
        return this.limits.length - 1;
    };


    this.next = function() {
        this.page = this.clampPage(++this.page);
    };

    this.prev = function() {
        this.page = this.clampPage(--this.page);
    };
    this.clampPage = function(pgNum) {
        console.log("pg.page", clamp(pgNum, MIN_PAGE, this.numPages() ));
        return clamp(pgNum, MIN_PAGE, this.numPages());
    };
};

pg = new PageState();

// temp debug
window.pg = pg;
window.snapToData = function(snapshot) {
    var result = {};

    Object.keys(snapshot).forEach((key) => {
        var item = snapshot[key];

        result[item.slug] = item;
    });

    return result;
};

export function controller() {
    var ctrl = this,
        schema = db.child("schemas/" + m.route.param("schema"));

    ctrl.schema  = null;
    ctrl.content = null;
    ctrl.results = null;

    // test
    pg.someInt = 42;

    schema.on("value", function(snap) {
        ctrl.schema = snap.val();
        ctrl.schema.key = snap.key();

        m.redraw();
    });

    // Go get initial data
    // eslint-disable-next-line newline-per-chained-call
    // debugger;

    function onValue(snap) {
        var content = [],
            oldestTs = Number.MAX_SAFE_INTEGER;

        snap.forEach(function(record) {
            var data = record.val();

            data.key          = record.key();
            data.published_at = data.published_at;
            data.sort_by      = data.updated_at;
            data.search       = slug(data.name, { separator : "" });

            if(data.sort_by < oldestTs) {
                oldestTs = data.sort_by;
            }

            content.push(data);
        });

        if(snap.numChildren() === pg.itemsPer) {
            pg.limits.push(oldestTs);
        } else {
            db.child("content/" + ctrl.schema.key)
                .endAt(oldestTs)
                .limitToLast(1)
                .once("value", function(quicksnap) {
                    debugger;
                });
            // Fewer results than `itemsPer`, this is definitely the last page.
            // pg.limits.push(NaN);
            // TODO do we just do nothing?
        }
        ctrl.content = content;

        m.redraw();
    }


    // TODO BOOKEND AT MAX
    ctrl.nextPage = function() {
        pg.next();
        ctrl.showPage();
    };
    // TODO 0 bookend
    ctrl.prevPage = function() {
        pg.prev();
        ctrl.showPage();
    };

    ctrl.showPage = function() {
        // console.log("try get next page with ", pageEndTs);
        db.child("content/" + ctrl.schema.key)
            .orderByChild("updated_at")
            .endAt(pg.limits[pg.page])
            .limitToLast(pg.itemsPer)
            .once("value", onValue);
    };

    ctrl.showPage();

    // Event handlers
    ctrl.add = function() {
        var result;

        result = db.child("content/" + ctrl.schema.key).push({
            created_at : db.TIMESTAMP,
            created_by : db.getAuth().uid
        });

        m.route(prefix("/content/" + ctrl.schema.key + "/" + result.key()));
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

        ctrl.results = ctrl.content.filter(function(content) {
            return fuzzy(input, content.search);
        });

        return m.redraw();
    }, 100);

    ctrl.remove = function(data) {
        var ref = db.child("content").child(ctrl.schema.key, data.key);

        if(window.confirm("Remove " + data.name + "?")) {
            ref.remove().catch(console.error.bind(console));
        }
    };
}

export function view(ctrl) {
    var current = m.route(),
        content = ctrl.results || ctrl.content || [],
        locked  = config.locked;

    return m("div", { class : css.nav },
        m(".head", { class : css.filter },
            m("input", {
                class       : css.text,
                placeholder : "Search...",
                oninput     : m.withAttr("value", ctrl.filter)
            })
        ),
        m("div", { class : css.body },
            m("ul", { class : css.list },
                content
                .sort(function(a, b) {
                    var aTime = a.sort_by,
                        bTime = b.sort_by;

                    return bTime - aTime;
                })
                .map(function(data) {
                    var url      = "/content/" + ctrl.schema.key + "/" + data.key,
                        cssClass = css.item,
                        status;

                    if(data.published_at && current.indexOf(url) === 0) {
                        cssClass = css.activePublished;
                    } else if(current.indexOf(url) === 0) {
                        cssClass = css.active;
                    } else if(data.published_at) {
                        cssClass = css.published_at;
                    }

                    if(isFuture(data.published_at)) {
                        status = "scheduled: " + format(data.published_at, dateFormat);
                    } else if(isPast(data.published_at)) {
                        status = "published: " + format(data.published_at, dateFormat);
                    } else if(data.updated_at) {
                        status = "updated: " + format(data.updated_at, dateFormat);
                    } else {
                        // Prevents a flash of NaN/NaN/NaN on new creation
                        status = "updated:";
                    }

                    return m("li", { class : cssClass },
                        m("a", {
                                class  : css.anchor,
                                href   : prefix("/content/" + ctrl.schema.key + "/" + data.key),
                                config : m.route
                            },
                            m("h3", { class : css.heading }, name(ctrl.schema, data)),
                            m("p", { class : css.date },
                                status
                            )
                        ),
                        m("div", { class : css.actions },
                            ctrl.schema.preview ?
                                m("a", {
                                        class  : css.preview,
                                        title  : "Preview",
                                        href   : ctrl.schema.preview + data.key,
                                        target : "_blank"
                                    },
                                    m("svg", { class : css.icon },
                                        m("use", { href : icons + "#preview" })
                                    )
                                ) :
                                null,
                            m("button", {
                                    // Attrs
                                    class    : css.remove,
                                    title    : "Remove",
                                    disabled : locked || null,

                                    // Events
                                    onclick : ctrl.remove.bind(ctrl, data)
                                },
                                m("svg", { class : css.icon },
                                    m("use", { href : icons + "#remove" })
                                )
                            )
                        )
                    );
                })
            )
        ),
        m("div", { class : css.metas },
            m("button", {
                    onclick  : ctrl.add,
                    class    : css.add,
                    disabled : locked || null
                },
                "Add " + ctrl.schema.name
            )
        ),
        m("div", { class : css.metas },
            m("button", {
                    onclick  : ctrl.prevPage.bind(ctrl),
                    class    : css.add,
                    disabled : locked || pg.page === 1 || null
                },
                "\< Prev Page"
            ),
            m("button", {
                    onclick  : ctrl.nextPage.bind(ctrl),
                    class    : css.add,
                    disabled : locked || pg.page === pg.numPages() || null
                },
                "Next Page \>"
            )
        )
    );
}
