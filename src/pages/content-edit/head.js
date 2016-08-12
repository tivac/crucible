import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import subSeconds from "date-fns/sub_seconds";
import clone from "lodash.clone";
import upper from "lodash.capitalize";
import get from "lodash.get";

import config, { icons } from "../../config";
import db from "../../lib/firebase";

import css from "./head.css";

var DEFAULT_START_TIME = "00:00",
    DEFAULT_END_TIME   = "23:59",
    DATE_FORMAT = "YYYY-MM-DD",
    TIME_FORMAT = "HH:mm";

export function controller(options) {
    var ctrl = this,
        ref  = options.ref,
        user = db.getAuth().uid,

        publishTs   = options.data.published_at ? options.data.published_at : null,
        unpublishTs = options.data.unpublished_at ? options.data.unpublished_at : null;

    ctrl.init = function() {
        ctrl.schedule   = false;

        if(publishTs) {
            ctrl.start = {
                date : format(publishTs, DATE_FORMAT),
                time : format(publishTs, TIME_FORMAT),
                ts   : publishTs
            };
        } else {
            ctrl.start = ctrl.nulledStart();
        }

        if(unpublishTs) {
            ctrl.end = {
                date : format(unpublishTs, DATE_FORMAT),
                time : format(unpublishTs, TIME_FORMAT),
                ts   : unpublishTs
            };
        } else {
            ctrl.end = ctrl.nulledEnd();
        }

        ctrl.recalculateTimestamps();
    };

    // Event handlers
    ctrl.update = function(section, field, value) {
        ctrl[section][field] = value;

        if(section === "start" || section === "end") {
            ctrl.recalculateTimestamps();
        }
    };

    ctrl.toggle = function(force) {
        ctrl.schedule = typeof force !== "undefined" ? Boolean(force) : !ctrl.schedule;
    };

    ctrl.publish = function() {
        var startTs,
            updated,
            pubDateIsPast,
            hasUnpubDate,
            unpubDateIsFuture;

        pubDateIsPast = Boolean(ctrl.start.ts) && isPast(ctrl.start.ts);

        hasUnpubDate  = Boolean(ctrl.end.ts);
        unpubDateIsFuture = hasUnpubDate && isFuture(ctrl.end.ts);

        if(pubDateIsPast && (unpubDateIsFuture || !hasUnpubDate)) {
            // Already currently published. No need to do anything.
            return;
        }

        ctrl.saving = true;

        m.redraw();

        if(ctrl.start.ts) {
            startTs = ctrl.start.ts;
        } else {
            startTs = subSeconds(Date.now(), 10);
        }

        updated = {
            // TODO: Remove `published` field, it's deprecated
            published    : startTs,
            published_at : startTs,
            published_by : user
        };

        debugger;

        if(ctrl.end.ts) {
            if(ctrl.start.ts > ctrl.end.ts) {
                ctrl.end = ctrl.nulledEnd();

                updated.unpublished_at = null;
                updated.unpublished_by = null;

                console.warn("Invalid end date. Resetting end date.");
            }
        }

        ref.update(updated, function() {
            ctrl.saving = false;

            m.redraw();
        });
    };

    ctrl.unpublish = function() {
        var nowTs = Date.now(),
            updated;

        if(ctrl.end.ts && isPast(ctrl.end.ts)) {
            // Already unpublished.
            return;
        }

        ctrl.saving = true;

        m.redraw();

        updated = {
            unpublished_at : nowTs,
            unpublished_by : user
        };

        ctrl.end = {
            date : format(nowTs, DATE_FORMAT),
            time : format(nowTs, TIME_FORMAT),
            ts   : nowTs
        };

        if(ctrl.start.ts) {
            let startIsInvalid = ctrl.start.ts > nowTs;

            if(startIsInvalid) {
                ctrl.start = ctrl.nulledStart();
            }
        }

        ref.update(updated, function() {
            ctrl.saving = false;

            m.redraw();
        });
    };

    ctrl.save = function(opts) {
        var updated = {};

        ctrl.saving = true;

        m.redraw();

        updated = {
            fields : opts.data.fields,
            name   : opts.data.name,
            slug   : opts.data.slug || null
        };

        updated = ctrl.addScheduleData(updated);

        ref.update(updated, function() {
            ctrl.saving = false;

            m.redraw();
        });
    };

    ctrl.addScheduleData = function(updated) {
        if(!ctrl.invalidDates) {
            let startTs = null,
                endTs = null,
                startTime = ctrl.start.time || DEFAULT_START_TIME,
                endTime = ctrl.end.time || DEFAULT_END_TIME;

            if(ctrl.start.date) {
                startTs = ctrl.getTimestampFromStr(ctrl.start.date + " " + startTime);
            }
            if(ctrl.end.date) {
                endTs = ctrl.getTimestampFromStr(ctrl.end.date + " " + endTime);
            }

            updated.published_at = startTs;
            updated.unpublished_at = endTs;
        }

        if(options.data.published_at && !updated.published_at) {
            // Publish date was removed. Save it.
            updated.published    = null;
            updated.published_at = null;
            updated.published_by = null;
        }

        if(options.data.unpublished_at && !updated.unpublished_at) {
            // Unpublish date was removed. Save it.
            updated.unpublished_at = null;
            updated.unpublished_by = null;
        }

        return updated;
    };


    ctrl.recalculateTimestamps = function() {
        var start = ctrl.start,
            end = ctrl.end;

        if(start.date) {
            start.ts = ctrl.getTimestampFromStr(start.date + " " + start.time);
        }
        if(end.date) {
            end.ts = ctrl.getTimestampFromStr(end.date + " " + end.time);
        }

        if(start.date && end.date) {
            ctrl.invalidDates = (start.ts > end.ts);
        }
    };

    ctrl.getTimestampFromStr = function(str) {
        return parseInt(format(str, "x"), 10);
    };

    ctrl.nulledStart = function() {
        return ctrl.nulledDate(DEFAULT_START_TIME);
    };

    ctrl.nulledEnd = function() {
        return ctrl.nulledDate(DEFAULT_END_TIME);
    };

    ctrl.nulledDate = function(time) {
        return clone({
            date : "",
            time : time,
            ts   : null
        });
    };    

    ctrl.init();
}

export function view(ctrl, options) {
    var status  = "draft",
        publishTs = options.data.published_at || options.data.published,
        unpublishTs = options.data.unpublished_at || options.data.unpublished,
        future  = isFuture(ctrl.start.date + " " + ctrl.start.time),
        wasUnpublished = unpublishTs < Date.now(),
        locked  = config.locked;

    if(isFuture(publishTs)) {
        status = "scheduled";
    } else if(isPast(publishTs)) {
        status = "published";
    } else if(isPast(unpublishTs)) {
        status = "unpublished";
    }

    function mSaveButton() {
        return m("div", { class : css.actions },
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
        );
    }


    function mScheduleButton() {
        return m("button", {
                // Attrs
                class : css.schedule,
                title : "Schedule a publish",

                // Events
                onclick : ctrl.toggle.bind(null, undefined)
            },
            m("svg", { class : css.onlyIcon },
                m("use", { href : icons + "#schedule" })
            )
        );
    }

    function mPublishButton() {
        var disabledClass = "";

        // TODO Better implementation.
        // if(ctrl.start.ts && isPast(ctrl.start.ts)) {
        //     disabledClass = css.disabledBtn;
        // }

        return m("button", {
                // Attrs
                class : [
                    css.publish,
                    disabledClass
                ].join(" "),
                title    : future ? "Schedule publish" : "Already published",
                disabled : locked || null,

                // Events
                onclick : ctrl.publish
            },
            m("svg", { class : css.icon },
                m("use", { href : icons + (future ? "#schedule" : "#publish") })
            ),
            future ? "Schedule" : "Publish"
        );
    }

    function mUnpublishButton() {
        var disabledClass = "";

        if(status === "draft") {
            return null;
        }

        // TODO Better implementation.
        // if(ctrl.end.ts && isPast(ctrl.end.ts)) {
        //     disabledClass = css.disabledBtn;
        // }

        return m("button", {
                // Attrs
                class : [
                    css.unpublish,
                    disabledClass
                ].join(" "),
                title    : wasUnpublished ? "Already unpublished" : "Unpublish immediately",
                disabled : locked || null,

                // Events
                onclick : ctrl.unpublish
            },
            m("svg", { class : css.icon },
                m("use", { href : icons + "#remove" })
            ),
            "Unpublish"
        );
    }

    function chronoInput(id, type, section, field) {
        return m("input", {
            class : css.date + ( ctrl.invalidDates ? " " + css.invalidDate : ""),
            type  : type,
            id    : id,
            value : ctrl[section][field],

            // Events
            oninput : m.withAttr("value", ctrl.update.bind(ctrl, section, field))
        });
    }

    function mDateScheduler() {
        if(!ctrl.schedule) {
            return null;
        }


        return m("div", { class : css.details },
            m("div", { class : css.start },
                m("p",
                    m("label", { for : "published_at_date" }, "Publish at")
                ),
                m("p",
                    chronoInput("published_at_date", "date", "start", "date")
                ),
                m("p",
                    chronoInput("published_at_time", "time", "start", "time")
                )
            ),
            m("div", { class : css.end },
                m("p",
                    m("label", { for : "unpublished_at_date" }, "Until (optional)")
                ),
                m("p",
                    chronoInput("unpublished_at_date", "date", "end", "date")
                ),
                m("p",
                    chronoInput("unpublished_at_time", "time", "end", "time")
                )
            )
        );
    }


    return m("div", { class : css.head },
        m("div", { class : css.main },
            m("p", { class : css[status] },
                upper(status)
            ),

            mSaveButton(),

            m("div", { class : css.publishing },
                mScheduleButton(),
                mPublishButton(),
                mUnpublishButton()
            )
        ),
        mDateScheduler()
    );
}
