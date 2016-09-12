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

import * as layout from "../layout/index.js";

import name from "../content-edit/name.js";

import css from "./listing.css";

var DB_ORDER_BY = "updated_at",
    dateFormat = "MM/DD/YYYY",
    pg = new PageState(),
    title = "TITLE NOT FOUND";

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

        overflow = (hasOverflow) ? content.splice(0, 1)[0] : null;
        ctrl.content = content;

        if(!isLastPage && overflow) {        
            pg.limits.push(oldestTs);
        }
    }

    // When we go backward, there's very little work to be done.
    function onPageReturn(snap) {
        var content = [];

        snap.forEach(function(record) {
            var item = contentFromRecord(record);

            content.push(item);
        });

        content.splice(0, 1);

        ctrl.content = content;
    }

    function onValue(snap) {
        var wentPrev = Boolean(ctrl.pg.nextPageTs());

        if(wentPrev) {
            onPageReturn.call(this, snap);
        } else {
            onNext.call(this, snap);
        }

        m.redraw();
    }

    function onBackfillPages(pgTs, snap) {
        var iter = 0,
            ts = [];

        // These pages are in Ascending order, but we
        // need to examine them in descending order.
        snap.forEach(function(record) {
            ts.push( record.val()[DB_ORDER_BY] );
        });
        ts.reverse();

        iter += pg.itemsPer;
        while(ts.length > iter) {
            if(pg.limits.indexOf( ts[iter] ) === -1) {
                pg.limits.push( ts[iter] );
            }
            iter += pg.itemsPer;
        }

        pg.page = pg.limits.indexOf(pgTs);

        ctrl.showPage();
    }

    function backfillPages(pgTs) {
        ctrl.contentLoc
            .orderByChild(DB_ORDER_BY)
            .startAt(pgTs)
            .once("value", onBackfillPages.bind(ctrl, pgTs));
    }

    function onSchemaValue(snap) {
        var pgTs = m.route.param("pgTs"),
            needsBackfill;

        if(!snap.exists()) {
            console.error("Error retrieving schema snapshot from Firebase.");
            return;
        }

        if(pgTs) {
            pgTs = parseInt(pgTs, 10);
            needsBackfill = pg.limits.indexOf(pgTs) === -1;
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
        ctrl.showPage();
    };

    ctrl.showPage = function() {
        var overflowItem = 1,
            pageTs = pg.currPageTs(),
            nextTs = pg.nextPageTs();

        if(ctrl.queryRef) {
            ctrl.queryRef.off();
        }

        console.log("pg.page", pg.page, "of", pg.limits.length - 1);

        if(nextTs) {
            // This is safer in the case that firebase updates 
            // because of another user's acitvity.
            ctrl.queryRef = ctrl.contentLoc
                .orderByChild(DB_ORDER_BY)
                .startAt(nextTs)
                .endAt(pageTs);

            ctrl.queryRef.on("value", onValue);
        }

        // Firebase orders Ascending, so the 
        // lowest/oldest entry will be first in the snapshot.
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


    ctrl.init();
}


export function view(ctrl) {
    var current = m.route(),
        content = ctrl.results || ctrl.content || [],
        locked  = config.locked;

    return m.component(layout, {
        title   : title || "TITLE NOT FOUND",
        content : [

            m("div", { class : css.nav },
                m("div", { class : css.crumbs },
                    "asdfasdfasdf"
                ),
                m("div", { class : css.body }, [
                    m("div", { class : css.metas },
                        m("input", {
                            class       : css.search,
                            placeholder : "Search...",
                            oninput     : m.withAttr("value", ctrl.filter)
                        }),
                        m("div", { class : css.pages }, [
                            m("button", {
                                    onclick  : ctrl.prevPage.bind(ctrl),
                                    class    : css.prevPage,
                                    disabled : locked || pg.page === 1 || null
                                },
                                "\< Prev Page"
                            ),
                            m("button", {
                                    onclick  : ctrl.nextPage.bind(ctrl),
                                    class    : css.nextPage,
                                    disabled : locked || pg.page === pg.numPages() || null
                                },
                                "Next Page \>"
                            )
                        ]),
                        m("div", { class : css.manage }, [
                            m("button", {
                                    onclick  : ctrl.add,
                                    class    : css.add,
                                    disabled : locked || null
                                },
                                "Add " + (ctrl.schema && ctrl.schema.name || "SCHEMA NAME NOT FOUND")
                            )
                        ])
                    ),
                    m("div", { class : css.listContainer }, 
                        m("ul", { class : css.list },
                            [
                                m("li", { class : css.listHeader }, [
                                    m("div", { class : css.listCol1 }, "Name"),
                                    m("div", { class : css.listCol2 }, "State"),
                                    m("div", { class : css.listCol3 }, "Scheduled"),
                                    m("div", { class : css.listCol4 }, "Actions")
                                ])
                            ].concat(
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
                                        pageTs = ctrl.pg.currPageTs(),

                                        itemName,
                                        itemStatus,
                                        itemSchedule;

                                    if(data.published_at && current.indexOf(url) === 0) {
                                        cssClass = css.activePublished;
                                    } else if(current.indexOf(url) === 0) {
                                        cssClass = css.active;
                                    } else if(data.published_at) {
                                        cssClass = css.published_at;
                                    }

                                    if(isFuture(data.published_at)) {
                                        // status = "scheduled: " + format(data.published_at, dateFormat);
                                        itemStatus = "scheduled";
                                    } else if(isPast(data.published_at)) {
                                        // status = "published: " + format(data.published_at, dateFormat);
                                        itemStatus = "published";
                                    } else if(data.updated_at) {
                                        // status = "updated: " + format(data.updated_at, dateFormat);
                                        itemStatus = "updated";
                                    } else {
                                        // Prevents a flash of NaN/NaN/NaN on new creation
                                        itemStatus = "updated:";
                                    }


                                    itemName = name(ctrl.schema, data);
                                    itemSchedule = data.published_at ? format(data.published_at, dateFormat) : "--/--/----";

                                    return m("li", { class : cssClass },
                                        m("a", {
                                                class  : css.anchor,
                                                config : m.route,

                                                href : prefix("/content/" + ctrl.schema.key + "/" + data.key +
                                                    "?pgTs=" + pageTs
                                                )
                                            },
                                            m("span", {
                                                    class : [ css.itemTitle, css.listCol1 ].join(" "),
                                                    title : itemName
                                                },
                                                itemName
                                            ),
                                            m("span", {
                                                    class : [ css.date, css.listCol2 ].join(" "),
                                                    title : itemStatus
                                                },
                                                itemStatus
                                            ),
                                            m("span", {
                                                    class : [ css.status, css.listCol3 ].join(" "),
                                                    title : itemSchedule
                                                },
                                                itemSchedule  
                                            ),
                                            m("div", { class : [ css.actions, css.listCol4 ].join(" ") },
                                                m("button", {
                                                        // Attrs
                                                        class    : [ css.remove, css.action ].join(" "),
                                                        title    : "Remove: " + itemName,
                                                        disabled : locked || null,

                                                        // Events
                                                        onclick : ctrl.remove.bind(ctrl, data)
                                                    },
                                                    m("svg", { class : css.icon },
                                                        m("use", { href : icons + "#remove" })
                                                    )
                                                ),
                                                ctrl.schema.preview ?
                                                    m("a", {
                                                            class  : [ css.preview, css.action ].join(" "),
                                                            title  : "Preview: " + itemName,
                                                            href   : ctrl.schema.preview + data.key,
                                                            target : "_blank"
                                                        },
                                                        m("svg", { class : css.icon },
                                                            m("use", { href : icons + "#preview" })
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
                ])
            )
        ]
    });
}

