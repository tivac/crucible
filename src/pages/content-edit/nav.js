import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import fuzzy from "fuzzysearch";
import debounce from "lodash.debounce";
import slug from "sluggo";

import config, { icons } from "../../config.js";

import db from "../../lib/firebase.js";
import prefix from "../../lib/prefix.js";
import PageState from "../../lib/nav-page-state.js";

import name from "./name.js";

import css from "./nav.css";

var DB_ORDER_BY = "updated_at",
    dateFormat = "MM/DD/YYYY",
    pg = new PageState();


console.log("undo global, temp");
window.pg = pg;

export function controller() {
    var ctrl = this,
        schema = db.child("schemas/" + m.route.param("schema"));

    ctrl.schema  = null;
    ctrl.content = null;
    ctrl.results = null;
    ctrl.pages = null;

    ctrl.onunload = function(a, b, c) {
        console.log("onunload NAV :: a, b, c", a, b, c);
    };

    schema.on("value", function(snap) {
        if(!snap.exists()) {
            console.error("Error retrieving schema snapshot from Firebase.");
        }
        ctrl.schema = snap.val();
        ctrl.schema.key = snap.key();

        m.redraw();
    });

    // Go get initial data
    // eslint-disable-next-line newline-per-chained-call

    // Having trouble naming this padPage thing. "overflow item"?
    // I need to peek at the next page's first item to precalc stuff
    // for it, like its starting timestamp, and whether or not we're 
    // currently on the last page.
    function onValue(snap) {
        var recordCt = Object.keys(snap.val()).length,
            hasOverflow = recordCt === pg.itemsPer + 1,
            isLastPage = !hasOverflow && recordCt <= pg.itemsPer,

            oldestTs = Number.MAX_SAFE_INTEGER,
            iter = 0,
            content = [],
            overflow;

        snap.forEach(function(record) {
            var data = record.val(),
                isOverflowItem = ++iter > pg.itemsPer;

            if(isOverflowItem) {
                overflow = record;

                return true; // Kill the loop, we're done.. (Firebase API)
            }

            data.key          = record.key();
            data.published_at = data.published_at;
            data.order_by     = data[DB_ORDER_BY];
            data.search       = slug(data.name, { separator : "" });

            if(data.order_by < oldestTs) {
                oldestTs = data.order_by;
            }

            content.push(data);
            return null;
        });

        ctrl.content = content;

        if(!isLastPage && overflow) {        
            pg.limits.push(oldestTs);
        }

        m.redraw();
    }

    ctrl.nextPage = function() {
        pg.next();
        ctrl.showPage();
    };
    ctrl.prevPage = function() {
        pg.prev();
        ctrl.showPage();
    };

    ctrl.showPage = function() {
        var overflowItem = 1;

        db.child("content/" + ctrl.schema.key)
            .orderByChild(DB_ORDER_BY)
            .endAt(pg.limits[pg.page])
            .limitToLast(pg.itemsPer + overflowItem)
            .once("value", onValue);
    };

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


    ctrl.showPage();
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
                    var aTime = a.order_by,
                        bTime = b.order_by;

                    // return aTime - bTime;
                    return bTime - aTime;
                })
                .map(function(data) {
                    var url      = "/content/" + ctrl.schema.key + "/" + data.key,
                        cssClass = css.item,
                        pageTs = pg.limits[pg.page],
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
                                // href   : prefix("/content/" + ctrl.schema.key + "/" + data.key + "?pgTs=" + pageTs),
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
