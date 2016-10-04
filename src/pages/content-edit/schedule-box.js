import m from "mithril";
import formatDate from "date-fns/format";

import css from "./head.css";

var DEFAULT_START_TIME = "00:00",
    DEFAULT_END_TIME   = "23:59",
    DATE_FORMAT = "YYYY-MM-DD",
    TIME_FORMAT = "HH:mm",
    TIMESTAMP_FORMAT = "x";

function scheduleStr(side, date, time) {
    if(!date) {
        return null;
    }

    if(!time) {
        time = side === "start" ? DEFAULT_START_TIME : DEFAULT_END_TIME;
    }

    return date + " " + time;
}

function timestampFromStr(str) {
    return parseInt(formatDate(str, TIMESTAMP_FORMAT), 10);
}

function timestamp(side, date, time) {
    var str = scheduleStr(side, date, time);

    return str ? timestampFromStr(str) : null;
}


// All data in and out of the `scheduler` is in the form of timestamps.
// All transformations to and from the date+time input fields will be
// handled by this controller.

export function controller(options) {
    var ctrl = this,
        content = options.content;

    ctrl.content = content;

    ctrl.inputs = null;
    ctrl.ts = null;

    ctrl.init = function() {
         ctrl.makeSchedule();
    };

    ctrl.makeSchedule = function() {
        var dates = content.get().dates,
            pub = dates.published_at,
            unpub = dates.unpublished_at;

        ctrl.inputs = {
            valid : dates.validSchedule,

            start : {
                date : pub ? formatDate(pub, DATE_FORMAT) : "",
                time : pub ? formatDate(pub, TIME_FORMAT) : DEFAULT_START_TIME
            },

            end : {
                date : unpub ? formatDate(unpub, DATE_FORMAT) : "",
                time : unpub ? formatDate(unpub, TIME_FORMAT) : DEFAULT_END_TIME
            }
        };
    };

    ctrl.get = function(side, part) {
        return ctrl.inputs[side][part];
    };

    function determineTimestamps() {
        ctrl.ts = {
            published_at   : timestamp("start", ctrl.inputs.start.date, ctrl.inputs.start.time),
            unpublished_at : timestamp("end",   ctrl.inputs.end.date,   ctrl.inputs.end.time)
        };
    }

    ctrl.onChange = function(side, part, val) {
        var dateField,
            ts;

        dateField = side === "start" ? "published" : "unpublished";
        ctrl.inputs[side][part] = val;

        determineTimestamps();
        ts = ctrl.ts[dateField + "_at"];

        content.schedule.setDateField(dateField, ts);
    };

    ctrl.init();
}


function mScheduleInput(ctrl, id, side, part) {
    return m("input", {
        id    : id,
        type  : part,
        class : ctrl.inputs.valid ? css.date : css.invalidDate,
        value : ctrl.get(side, part),

        // Events
        oninput : m.withAttr("value", ctrl.onChange.bind(ctrl, side, part))
    });
}

export function view(ctrl, options) {
    var schedule = ctrl.content.schedule;

    // Update schedule on redraw.
    ctrl.makeSchedule();

    return m("div", { class : css.details },
        m("div", { class : css.start },
            m("p", m("label", { for : "published_at_date" }, "Publish at")),

            m("p", mScheduleInput(ctrl, "published_at_date", "start", "date")),
            m("p", mScheduleInput(ctrl, "published_at_time", "start", "time"))
        ),
        m("div", { class : css.end },
            m("p", m("label", { for : "unpublished_at_date" }, "Until (optional)")),

            m("p", mScheduleInput(ctrl, "unpublished_at_date", "end", "date")),
            m("p", mScheduleInput(ctrl, "unpublished_at_time", "end", "time")),
            m("p",
                m("button", {
                    class : css.clearSchedule,
                    title : "Clear schedule dates",

                    // Events
                    onclick : schedule.clearSchedule.bind(schedule)
                },
                "clear schedule"
                )
            )
        )
    );
}
