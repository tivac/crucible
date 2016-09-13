import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import fuzzy from "fuzzysearch";
import debounce from "lodash.debounce";
import get from "lodash.get";
import slug from "sluggo";

import config, { icons } from "../../config.js";

import db from "../../lib/firebase.js";
import prefix from "../../lib/prefix.js";
import PageState from "../../lib/nav-page-state.js";

import * as layout from "../layout/index.js";

import name from "../content-edit/name.js";

import css from "./listing.css";

var DB_ORDER_BY = "updated_at",
    INITIAL_SEARCH_CHUNK_SIZE = 100,
    SEARCH_MODE_RECENT = "recent",
    SEARCH_MODE_ALL = "all",
    dateFormat = "MM/DD/YYYY";
    // pg = new PageState();

function contentFromRecord(record) {
    var data = record.val();

    data.key          = record.key();
    data.published_at = data.published_at;
    data.order_by     = data[DB_ORDER_BY];
    data.search       = slug(data.name, { separator : "" });

    return data;
}

function contentFromSnapshot(snap, removeOverflow) {
    var content = [];

    snap.forEach(function(record) {
        var item = contentFromRecord(record);

        content.push(item);
    });

    if(removeOverflow) {
        content.splice(0, 1);
    }

    return content;
}

export function controller() {
    var ctrl = this,
        schema;

    ctrl.schema  = null;
    ctrl.content = null;
    ctrl.results = null;

    ctrl.pg = new PageState();
    ctrl.contentLoc = null;
    ctrl.queryRef = null;

    ctrl.searchInput = null;
    ctrl.searchMode = SEARCH_MODE_RECENT;    

    // Go get initial data
    // eslint-disable-next-line newline-per-chained-call

    // We need to check for an "overflowItem" to peek at
    // the next page's first item. This lets us grab the
    // next page's timestamp limit, or find we're on the last page.
    function onNext(snap) {
        var recordCt    = Object.keys(snap.val()).length,
            isLastPage  = recordCt <= ctrl.pg.itemsPer,
            hasOverflow = !isLastPage && recordCt === ctrl.pg.itemsPer + 1,

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
            ctrl.pg.limits.push(oldestTs);
        }
    }

    // When we go backward, there's very little work to be done.
    function onPageReturn(snap) {
        ctrl.content = contentFromSnapshot(snap, true);
    }

    function onValue(snap) {
        console.log("onValue");
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
            if(ctrl.pg.limits.indexOf( ts[iter] ) === -1) {
                ctrl.pg.limits.push( ts[iter] );
            }
            iter += ctrl.pg.itemsPer;
        }

        ctrl.pg.page = ctrl.pg.limits.indexOf(pgTs);

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
            needsBackfill = ctrl.pg.limits.indexOf(pgTs) === -1;
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

    ctrl.changeItemsPer = function(val) {
        var num = parseInt(val, 10);

        if(isNaN(num)) {
            return;
        }

        ctrl.pg.changeItemsPer(num);
        ctrl.showPage();
    };

    ctrl.nextPage = function() {
        ctrl.pg.next();
        ctrl.showPage();
    };
    ctrl.prevPage = function() {
        ctrl.pg.prev();
        ctrl.showPage();
    };

    ctrl.showPage = function() {
        var overflowItem = 1,
            pageTs = ctrl.pg.currPageTs(),
            nextTs = ctrl.pg.nextPageTs();

        if(ctrl.queryRef) {
            ctrl.queryRef.off();
        }

        if(nextTs) {
            // This is safer in the case that firebase updates 
            // because of another user's acitvity.
            ctrl.queryRef = ctrl.contentLoc
                .orderByChild(DB_ORDER_BY)
                .startAt(nextTs)
                .endAt(pageTs);

            ctrl.queryRef.on("value", onValue);

            return;
        }

        // Firebase orders Ascending, so the 
        // lowest/oldest entry will be first in the snapshot.
        // We want items in descneding, so we slice our
        // query from the other end via .endAt/.limitToLast
        ctrl.queryRef = ctrl.contentLoc
            .orderByChild(DB_ORDER_BY)
            .endAt(ctrl.pg.limits[ctrl.pg.page])
            .limitToLast(ctrl.pg.itemsPer + overflowItem);

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

    ctrl.remove = function(data) {
        var ref = db.child("content").child(ctrl.schema.key, data.key);

        if(window.confirm("Remove " + data.name + "?")) {
            ref.remove().catch(console.error.bind(console));
        }
    };

    ctrl.change = function(page, e) {
        e.preventDefault();

        ctrl.page = page;
    };


    // m.redraw calls are necessary due to debouncing, this function
    // may not be executing during a planned redraw cycle

    ctrl.registerSearchInput = function(el) {
        ctrl.searchInput = el;
    };

    ctrl.searchFor = debounce(function(input) {
        ctrl.searchMode = SEARCH_MODE_RECENT;

        if(input.length < 2) {
            ctrl.results = false;

            return m.redraw();
        }

        input = slug(input);
        ctrl.getSearchResults(input);

        return null;
    }, 800);

    function onSearchResults(searchStr, snap) {
        var contents = contentFromSnapshot(snap);

        ctrl.results = contents.filter(function(content) {
            return fuzzy(searchStr, content.search);
        });

        return m.redraw();
    }

    ctrl.getSearchResults = function(searchStr) {
        if(ctrl.queryRef) {
            ctrl.queryRef.off();
        }

        ctrl.queryRef = ctrl.contentLoc
            .orderByChild(DB_ORDER_BY)
            .endAt(Number.MAX_SAFE_INTEGER)
            .limitToLast(INITIAL_SEARCH_CHUNK_SIZE);

        ctrl.queryRef.on("value", onSearchResults.bind(ctrl, searchStr));
    };

    ctrl.searchAll = function() {
        var searchStr = ctrl.searchInput && ctrl.searchInput.value;

        if(!searchStr) {
            return; // Not ready
        }

        ctrl.searchMode = SEARCH_MODE_ALL;

        if(ctrl.queryRef) {
            ctrl.queryRef.off();
        }

        ctrl.queryRef = ctrl.contentLoc
            .orderByChild(DB_ORDER_BY);

        ctrl.queryRef.on("value", onSearchResults.bind(ctrl, searchStr));
    };


    ctrl.clearSearch = function() {
        if(ctrl.searchInput) {
            ctrl.searchInput.value = "";
            ctrl.results = null;
            ctrl.pg.first();
            ctrl.showPage();
        }
    };

    ctrl.init();
}


export function view(ctrl) {
    var current = m.route(),
        content = ctrl.results || ctrl.content || [],
        locked  = config.locked,
        isSearchResults = Boolean(ctrl.results);

    return m.component(layout, {
        title   : get(ctrl, "schema.name") || "...",
        content : [

            m("div", { class : css.listing },
                m("div", { class : css.crumbs },
                    m("button", {
                            onclick  : ctrl.add,
                            class    : css.add,
                            disabled : locked || null
                        },
                        "+ Add " + (ctrl.schema && ctrl.schema.name || "...")
                    )
                ),
                m("div", { class : css.body }, [
                    m("div", { class : css.metas },
                        m("div", {
                                class : css.search
                            }, [
                            m("input", {
                                class       : css.searchInput,
                                placeholder : "Search...",
                                oninput     : m.withAttr("value", ctrl.searchFor),

                                config : ctrl.registerSearchInput
                            }),
                            ctrl.searchInput && ctrl.searchInput.value ?
                                m("button", {
                                    class   : css.searchClear,
                                    onclick : ctrl.clearSearch.bind(ctrl)
                                }, "") :
                            null
                        ]),
                        m("div", { class : css.manage }, [
                            m("span", { class : css.itemsPerLabel }, "Items Per Page: "),
                            m("input", {
                                class : css.itemsPer,
                                type  : "number",
                                value : ctrl.pg.itemsPer,

                                disabled : isSearchResults,

                                onchange : m.withAttr("value", ctrl.changeItemsPer)
                            })
                        ]),
                        (function() {
                            var searchContents;

                            if(isSearchResults) {
                                if(ctrl.searchMode === SEARCH_MODE_ALL) {
                                    searchContents = "Showing all results.";
                                } else {
                                    searchContents = [
                                        "Showing results from most recent " + INITIAL_SEARCH_CHUNK_SIZE + " items... ",
                                        m("button", {
                                                onclick : ctrl.searchAll.bind(ctrl),
                                                class   : css.nextPage
                                                // ,
                                                // disabled : locked ||  || ctrl.pg.page === 1 || null // TODO
                                            },
                                            "Search All"
                                        ) 
                                    ];
                                }
                                
                                return m("div", { class : css.showingResults },
                                    searchContents
                                );
                            }

                            return m("div", { class : css.pages }, [
                                m("button", {
                                        onclick  : ctrl.prevPage.bind(ctrl),
                                        class    : css.prevPage,
                                        disabled : locked || isSearchResults || ctrl.pg.page === 1 || null
                                    },
                                    "\< Prev Page"
                                ),
                                m("span", {
                                        class : css.currPage
                                    },
                                    isSearchResults ? "-" : ctrl.pg.page
                                ),
                                m("button", {
                                        onclick  : ctrl.nextPage.bind(ctrl),
                                        class    : css.nextPage,
                                        disabled : locked || isSearchResults || ctrl.pg.page === ctrl.pg.numPages() || null
                                    },
                                    "Next Page \>"
                                )
                            ]);
                        }())
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

                                    if(isPast(data.unpublished_at)) {
                                        itemStatus = "unpublished";
                                    } else if(isFuture(data.published_at)) {
                                        itemStatus = "scheduled";
                                    } else if(isPast(data.published_at)) {
                                        // itemStatus = "published";
                                        itemStatus = "live";
                                    } else if(data.updated_at) {
                                        itemStatus = "updated";
                                    } else {
                                        // Prevents a flash of NaN/NaN/NaN on new creation
                                        itemStatus = "...";
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

