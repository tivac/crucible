import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import subSeconds from "date-fns/sub_seconds";
import compareDesc from "date-fns/compare_desc";
import get from "lodash.get";
import upper from "lodash.capitalize";

import config, { icons } from "../../config";
import db from "../../lib/firebase";

import css from "./head.css";

export function controller(options) {
    var ctrl = this,
        ref  = options.ref,
        uid  = config.user.uid,
        
        publish   = options.data.published_at ? options.data.published_at : null,
        unpublish = options.data.unpublished_at ? options.data.unpublished_at : null;

    ctrl.schedule   = false;
    ctrl.unschedule = false;

    if(publish) {
        ctrl.start = {
            date : format(publish, "YYYY-MM-DD"),
            time : format(publish, "HH:mm")
        };
    } else {
        ctrl.start = {
            date : "",
            time : get(config, "defaults.publish_start_time") || ""
        };
    }

    if(unpublish) {
        ctrl.end = {
            date : format(unpublish, "YYYY-MM-DD"),
            time : format(unpublish, "HH:mm")
        };
    } else {
        ctrl.end = {
            date : "",
            time : ""
        };
    }

    // Event handlers
    ctrl.update = function(section, field, value) {
        ctrl[section][field] = value;
    };

    ctrl.toggle = function(force) {
        ctrl.schedule = typeof force !== "undefined" ? Boolean(force) : !ctrl.schedule;
    };

    ctrl.publish = function() {
        var start, end;

        if(ctrl.schedule && ctrl.start.date) {
            start = ctrl.start.date + " " + (ctrl.start.time || "00:00");
        } else {
            start = subSeconds(Date.now(), 10);
        }

        if(ctrl.schedule && ctrl.end.date) {
            end = ctrl.end.date + " " + (ctrl.end.time || "00:00");

            if(compareDesc(end, start) !== -1) {
                // TODO: handle
                return console.error("Invalid end date");
            }
        }

        return ref.update({
            published_at   : parseInt(format(start, "x"), 10),
            published_by   : uid,
            unpublished_at : end ? parseInt(format(end, "x"), 10) : null,
            unpublished_by : end ? uid : null
        });
    };

    ctrl.unpublish = function() {
        ref.update({
            // TODO: Remove `published` field, it's deprecated
            published    : null,
            published_at : null,
            published_by : null,

            unpublished_at : db.TIMESTAMP,
            unpublished_by : uid
        });

        // TODO: THIS IS SUPER GROSS
        ctrl.start = {
            date : "",
            time : ""
        };

        ctrl.end = {
            date : "",
            time : ""
        };
    };

    ctrl.save = function(opts) {
        ctrl.saving = true;

        m.redraw();

        ref.update({
            fields : opts.data.fields,
            name   : opts.data.name,
            slug   : opts.data.slug || null
        }, function() {
            ctrl.saving = false;

            m.redraw();
        });
    };
}

export function view(ctrl, options) {
    var status  = "draft",
        publish = options.data.published_at || options.data.published,
        future  = isFuture(ctrl.start.date + " " + ctrl.start.time),
        locked  = config.locked;

    if(isFuture(publish)) {
        status = "scheduled";
    } else if(isPast(publish)) {
        status = "published";
    }

    return m("div", { class : css.head },
        m("div", { class : css.main },
            m("p", { class : css[status] },
                upper(status)
            ),
            m("div", { class : css.actions },
                ctrl.saving ?
                    "SAVING..." : m("button", {
                        // Attrs
                        class    : css.save,
                        title    : "Save your changes",
                        disabled : locked || null,

                        // Events
                        onclick : ctrl.save.bind(null, options)
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#save" })
                    ),
                    "Save"
                )
            ),
            m("div", { class : css.publishing },
                m("button", {
                        // Attrs
                        class : css.schedule,
                        title : "Schedule a publish",

                        // Events
                        onclick : ctrl.toggle.bind(null, undefined)
                    },
                    m("svg", { class : css.onlyIcon },
                        m("use", { href : icons + "#schedule" })
                    )
                ),
                m("button", {
                        // Attrs
                        class    : css.publish,
                        title    : future ? "Schedule publish" : "Publish now",
                        disabled : locked || null,

                        // Events
                        onclick : ctrl.publish
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + (future ? "#schedule" : "#publish") })
                    ),
                    future ? "Schedule" : "Publish"
                ),
                status === "draft" ?
                    null :
                    m("button", {
                            // Attrs
                            class    : css.unpublish,
                            title    : "Unpublish immediately",
                            disabled : locked || null,

                            // Events
                            onclick : ctrl.unpublish
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : icons + "#remove" })
                        ),
                        "Unpublish"
                    )
            )
        ),
        ctrl.schedule ? m("div", { class : css.details },
            m("div", { class : css.start },
                m("p",
                    m("label", { for : "published_at_date" }, "Publish at")
                ),
                m("p",
                    m("input", {
                        class : css.date,
                        type  : "date",
                        id    : "published_at_date",
                        value : ctrl.start.date,

                        // Events
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "start", "date"))
                    })
                ),
                m("p",
                    m("input", {
                        class : css.date,
                        type  : "time",
                        id    : "published_at_time",
                        value : ctrl.start.time,

                        // Events
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "start", "time"))
                    })
                )
            ),
            m("div", { class : css.end },
                m("p",
                    m("label", { for : "unpublished_at_date" }, "Until (optional)")
                ),
                m("p",
                    m("input", {
                        class : css.date,
                        type  : "date",
                        id    : "unpublished_at_date",
                        value : ctrl.end.date,

                        // Events
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "end", "date"))
                    })
                ),
                m("p",
                    m("input", {
                        class : css.date,
                        type  : "time",
                        id    : "unpublished_at_time",
                        value : ctrl.end.time,

                        // Events
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "end", "time"))
                    })
                )
            )
        ) : null
    );
}
