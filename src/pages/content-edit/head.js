import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import subSeconds from "date-fns/sub_seconds";
import upper from "lodash.capitalize";
import get from "lodash.get";

import config, { icons } from "../../config";
import db from "../../lib/firebase";

import css from "./head.css";

var DEFAULT_START_TIME = "00:00",
    DEFAULT_END_TIME   = "23:59",
    DATE_FORMAT = "YYYY-MM-DD",
    TIME_FORMAT = "HH:mm";


function makeScheduleObj(ts) {
     return {
        date : format(ts, DATE_FORMAT),
        time : format(ts, TIME_FORMAT),
        ts   : ts
    };
}

function getTimestampFromStr(str) {
    return parseInt(format(str, "x"), 10);
}

function nulledDate(time) {
    return {
        date : "",
        time : time,
        ts   : null
    };
}

export function controller(options) {
    var ctrl = this,
        ref  = options.ref,
        user = db.getAuth().uid,

        publishTs   = options.data.published_at ? options.data.published_at : null,
        unpublishTs = options.data.unpublished_at ? options.data.unpublished_at : null,

        defaultStartTime = get(config, "defaults.publish_start_time") || DEFAULT_START_TIME,
        defaultEndTime   = get(config, "defaults.publish_end_time")   || DEFAULT_END_TIME;

    ctrl.init = function() {
        ctrl.hidden = {};

        ctrl.schedule   = false;

        ctrl.start = (publishTs) ? makeScheduleObj(publishTs) : nulledDate(defaultStartTime);
        ctrl.end   = (unpublishTs) ? makeScheduleObj(unpublishTs) : nulledDate(defaultEndTime);

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
            // Already currently published.
            return;
        }

        ctrl.saving = true;
        m.redraw();

        startTs = subSeconds(Date.now(), 10);
        ctrl.start = makeScheduleObj(startTs);

        updated = {
            published_at : startTs,
            published_by : user
        };

        if(ctrl.end.ts && (ctrl.start.ts > ctrl.end.ts)) {
            ctrl.end = nulledDate(defaultEndTime);

            updated.unpublished_at = null;
            updated.unpublished_by = null;

            console.warn("Invalid end date. Resetting end date.");
        }

        ref.update(updated, function() {
            ctrl.saving = false;
            m.redraw();
        });
    };

    ctrl.unpublish = function() {
        var nowTs,
            updated;

        if(ctrl.end.ts && isPast(ctrl.end.ts)) {
            // Already unpublished.
            return;
        }

        ctrl.saving = true;
        m.redraw();

        nowTs = Date.now();
        ctrl.end = makeScheduleObj(nowTs);

        updated = {
            unpublished_at : nowTs,
            unpublished_by : user
        };

        if(ctrl.start.ts &&  ctrl.start.ts > ctrl.end.ts) {
            // Invalid start.
            ctrl.start = nulledDate(defaultStartTime);
        }

        ref.update(updated, function() {
            ctrl.saving = false;
            m.redraw();
        });
    };

    ctrl.clearSchedule = function() {
        ctrl.start = nulledDate(defaultStartTime);
        ctrl.end   = nulledDate(defaultEndTime);
        ctrl.invalidDates = false;
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
        var startTs = null,
            endTs = null,
            startTime = ctrl.start.time || DEFAULT_START_TIME,
            endTime = ctrl.end.time || DEFAULT_END_TIME;

        if(ctrl.invalidDates) {
            return updated;
        }

        if(ctrl.start.date) {
            startTs = getTimestampFromStr(ctrl.start.date + " " + startTime);
        }

        if(ctrl.end.date) {
            endTs = getTimestampFromStr(ctrl.end.date + " " + endTime);
        }

        updated.published_at = startTs;
        updated.unpublished_at = endTs;

        if(options.data.published_at && !updated.published_at) {
            // Publish date was removed. Null it out.
            updated.published_at = null;
            updated.published_by = null;

            ctrl.start = nulledDate(defaultStartTime);
        }

        if(options.data.unpublished_at && !updated.unpublished_at) {
            // Unpublish date was removed. Null it out.
            updated.unpublished_at = null;
            updated.unpublished_by = null;

            ctrl.end = nulledDate(defaultEndTime);
        }

        return updated;
    };

    ctrl.setHidden = function(field, isHidden) {
        var wasHidden = ctrl.hidden[field.key];

        if(wasHidden === isHidden) {
            return; // No change.
        }

        if(isHidden) {
            ctrl.hidden[field.key] = true;
        }
    };

    ctrl.recalculateTimestamps = function() {
        var start = ctrl.start,
            end = ctrl.end;

        if(start.date) {
            start.ts = getTimestampFromStr(start.date + " " + start.time);
        }
        if(end.date) {
            end.ts = getTimestampFromStr(end.date + " " + end.time);
        }

        if(start.date && end.date) {
            ctrl.invalidDates = (start.ts > end.ts);
        }
    };  

    ctrl.init();
}

export function view(ctrl, options) {
    var status  = "draft",
        publishTs = options.data.published_at,
        unpublishTs = options.data.unpublished_at,
        future  = isFuture(ctrl.start.date + " " + ctrl.start.time),
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
        var isDisabled = false;

        // TODO Better implementation.
        // if(ctrl.start.ts && isPast(ctrl.start.ts)) {
        //     isDisabled = true;
        // }

        return m("button", {
                // Attrs
                class    : css.publish,
                title    : future ? "Schedule publish" : "Already published",
                disabled : locked || isDisabled || null,

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
        var isDisabled = false;

        if(status === "draft") {
            return null;
        }

        // TODO Better implementation.
        // if(ctrl.end.ts && isPast(ctrl.end.ts)) {
        //     isDisabled = true;
        // }

        return m("button", {
                // Attrs
                class    : css.unpublish,
                title    : isPast(unpublishTs) ? "Already unpublished" : "Unpublish immediately",
                disabled : locked || isDisabled || null,

                // Events
                onclick : ctrl.unpublish
            },
            m("svg", { class : css.icon },
                m("use", { href : icons + "#remove" })
            ),
            "Unpublish"
        );
    }

    function scheduleInput(id, type, section, field) {
        return m("input", {
            class : ctrl.invalidDates ? css.invalidDate : css.date,
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
                    scheduleInput("published_at_date", "date", "start", "date")
                ),
                m("p",
                    scheduleInput("published_at_time", "time", "start", "time")
                )
            ),
            m("div", { class : css.end },
                m("p",
                    m("label", { for : "unpublished_at_date" }, "Until (optional)")
                ),
                m("p",
                    scheduleInput("unpublished_at_date", "date", "end", "date")
                ),
                m("p",
                    scheduleInput("unpublished_at_time", "time", "end", "time")
                ),
                m("p",
                    m("button", {
                        class    : css.clearSchedule,
                        title    : "Clear schedule dates",
                        disabled : (!ctrl.start.ts && !ctrl.end.ts),

                        // Events
                        onclick : ctrl.clearSchedule
                    },
                    "clear schedule"
                    )
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
