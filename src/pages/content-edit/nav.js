import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import fuzzy from "fuzzysearch";
import debounce from "lodash.debounce";
import slug from "sluggo";

import config from "../../config.js";

import { ref } from "../../lib/firebase.js";
import name from "./name.js";
import { prefix } from "../../lib/routes.js";

import css from "./nav.css";

var dateFormat = "MM/DD/YYYY";

export function controller() {
    var ctrl = this,

        schema = ref.child("schemas/" + m.route.param("schema"));

    ctrl.page = 0;

    ctrl.schema  = null;
    ctrl.content = null;
    ctrl.results = null;

    schema.on("value", function(snap) {
        ctrl.schema = snap.val();
        ctrl.schema.key = snap.key;

        m.redraw();
    });

    // Go get initial data
    ref.child("content/" + ctrl.schema.key).orderByChild("published_at").on("value", function(snap) {
        var content = [];

        snap.forEach(function(record) {
            var data = record.val();

            data.key          = record.key;
            data.published_at = data.published_at || data.published;
            data.search       = slug(data.name, { separator : "" });

            content.push(data);
        });

        ctrl.content = content;

        m.redraw();
    });

    // Event handlers
    ctrl.add = function() {
        var result;

        result = ref.child("content/" + ctrl.schema.key).push({
            created_at : ref.TIMESTAMP,
            created_by : config.user.uid
        });

        m.route(prefix("/content/" + ctrl.schema.key + "/" + result.key));
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
        var ref = ref.child("content").child(ctrl.schema.key).child(data.key);

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
                    var aTime = a.published_at || a.published || a.updated_at,
                        bTime = b.published_at || b.published || b.updated_at;

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
                                        m("use", { href : config.icons + "#preview" })
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
                                    m("use", { href : config.icons + "#remove" })
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
        )
    );
}
