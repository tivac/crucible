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


console.log("TEMP undo global pg TEMP");
window.pg = pg;

function contentFromRecord(record) {
    var data = record.val();

    data.key          = record.key();
    data.published_at = data.published_at;
    data.order_by     = data[DB_ORDER_BY];
    data.search       = slug(data.name, { separator : "" });

    return data;
}


export function controller() {
    var ctrl = this,
        schema;

    ctrl.schema  = null;
    ctrl.content = null;
    ctrl.results = null;

    ctrl.pg = pg;
    ctrl.contentLoc = null;
    ctrl.queryRef = null;

    // Go get initial data
    // eslint-disable-next-line newline-per-chained-call

    // We need to check for an "overflowItem" to peek at
    // the next page's first item. This lets us grab the
    // next page's timestamp limit, or find we're on the last page.
    function onNext(snap) {
        var recordCt    = Object.keys(snap.val()).length,
            isLastPage  = recordCt <= pg.itemsPer,
            hasOverflow = !isLastPage && recordCt === pg.itemsPer + 1,

            oldestTs = Number.MAX_SAFE_INTEGER,
            content  = [],
            overflow;

        snap.forEach(function(record) {
            var item = contentFromRecord(record);

            oldestTs = (item.order_by < oldestTs) ? item.order_by : oldestTs;
            content.push(item);
        });

        overflow = (hasOverflow) ? content.pop() : null;
        ctrl.content = content;

        if(!isLastPage && overflow) {        
            pg.limits.push(oldestTs);
        }
    }

    // When we go backward, there's very little work to be done.
    function onPrev(snap) {
        var content = [];

        snap.forEach(function(record) {
            var item = contentFromRecord(record);

            content.push(item);
        });

        ctrl.content = content;
    }

    function onValue(snap) {
        var wentPrev = ctrl.pg.hasNextPageTs();

        if(wentPrev) {
            onPrev.call(this, snap);
        } else {
            onNext.call(this, snap);
        }

        m.redraw();
    }

    function onBackfillPages(pgTs, snap) {
        var iter = 0;

        var ts = [];

        console.log("onBackfillPages");

        // These pages are in Ascending order, but we
        // need to examine them in descending order.
        snap.forEach(function(record) {
            // if(++iter === pg.itemsPer) {
            //     pg.limits.push(record.val()[DB_ORDER_BY]);
            //     iter = 0;
            // }

            ts.push({
                ts   : record.val()[DB_ORDER_BY],
                name : record.val().slug
            });
        });

        ts.reverse();
        while(ts.length > (iter += pg.itemsPer)) {
            pg.limits.push(ts[iter].ts);
        }

        pg.limits.push(pgTs);
        pg.page = pg.limits.indexOf(pgTs);

        ctrl.showPage();
    }

    function backfillPages(pgTs) {
        console.log("TODO backfill pages");

        // pgTs++; // Don't include current page's first item.

        ctrl.contentLoc
            .orderByChild(DB_ORDER_BY)
            .startAt(pgTs)
            .once("value", onBackfillPages.bind(ctrl, pgTs));
    }

    function onSchemaValue(snap) {
        var pgTs = m.route.param("pgTs"),
            needsBackfill;

        if(pgTs) {
            pgTs = parseInt(pgTs, 10);
            needsBackfill = pg.limits.indexOf(pgTs) === -1;
        }

        if(!snap.exists()) {
            console.error("Error retrieving schema snapshot from Firebase.");
            return;
        }

        ctrl.schema = snap.val();
        ctrl.schema.key = snap.key();

        ctrl.contentLoc = db.child("content/" + ctrl.schema.key);

        if(needsBackfill) {
            pgTs = parseInt(pgTs, 10);
            backfillPages(pgTs);
        } else {
            ctrl.showPage();
        }
    }

    ctrl.init = function() {
        schema = db.child("schemas/" + m.route.param("schema"));
        schema.on("value", onSchemaValue);
    };


    ctrl.nextPage = function() {
        pg.next();
        ctrl.showPage();
    };
    ctrl.prevPage = function() {
        pg.prev();
        ctrl.showPage("back");
    };

    ctrl.showPage = function(back) {
        var overflowItem = (back === "back") ? 0 : 1;

        if(ctrl.queryRef) {
            ctrl.queryRef.off("value", onValue);
        }

        // Firebase orders Ascending, so the lowest value &
        // oldest entry will be first in the snapshot.
        // We want items in descneding, so we slice our
        // query from the other end via .endAt/.limitToLast
        ctrl.queryRef = ctrl.contentLoc
            .orderByChild(DB_ORDER_BY)
            .endAt(pg.limits[pg.page])
            .limitToLast(pg.itemsPer + overflowItem);

        ctrl.queryRef.on("value", onValue);
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

            console.log("nav  : filter redraw");
            return m.redraw();
        }

        input = slug(input);

        ctrl.results = ctrl.content.filter(function(content) {
            return fuzzy(input, content.search);
        });

        console.log("nav  : filter redraw");
        return m.redraw();
    }, 100);

    ctrl.remove = function(data) {
        var ref = db.child("content").child(ctrl.schema.key, data.key);

        if(window.confirm("Remove " + data.name + "?")) {
            ref.remove().catch(console.error.bind(console));
        }
    };


    ctrl.init();
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
                        page = ctrl.pg.page,
                        pageTs = ctrl.pg.currPageTs(),
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
                                config : m.route,

                                // href : prefix("/content/" + ctrl.schema.key + "/" + data.key),
                                href : prefix("/content/" + ctrl.schema.key + "/" + data.key +
                                    "?pgTs=" + ctrl.pg.currPageTs()
                                    // "?" + [ "page=" + page, "pageTs=" + pageTs ].join("&")
                                )
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

