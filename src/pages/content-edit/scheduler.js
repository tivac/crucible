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


// Since everything about the scheduler is derivative from the raw timestamps
// of "published_at", "unpublished_at", we'll give this little popup its own
// controller to be the transformer back and forth from timestamps <-> date/time

export function controller(options) {
    var ctrl = this,
        content = options.content;

    ctrl.schedule = null;
    ctrl.published_at = null;
    ctrl.unpublished_at = null;

    ctrl.init = function() {
         ctrl.makeSchedule();
    };

    ctrl.makeSchedule = function() {
        var state = content.get(),
            pub = state.dates.published_at,
            unpub = state.dates.unpublished_at;

        ctrl.schedule = {
            valid : state.dates.validSchedule,

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
        return ctrl.schedule[side][part];
    };

    function determineTimestamps() {
        var schedule = ctrl.schedule;

        ctrl.published_at   = timestamp("start", schedule.start.date, schedule.start.time);
        ctrl.unpublished_at = timestamp("end",   schedule.end.date,   schedule.end.time);
    }

    ctrl.onChange = function(side, part, val) {
        var dateField,
            ts;

        dateField = side === "start" ? "published_at" : "unpublished_at";
        ctrl.schedule[side][part] = val;

        determineTimestamps();
        ts = ctrl[dateField];

        content.setDateField(dateField, ts);
    };

    ctrl.init();
}


function mScheduleInput(content, ctrl, id, side, part) {
    return m("input", {
        id    : id,
        type  : part,
        class : ctrl.schedule.valid ? css.date : css.invalidDate,
        value : ctrl.get(side, part),

        // Events
        oninput : m.withAttr("value", ctrl.onChange.bind(ctrl, side, part))
    });
}

export function view(ctrl, options) {
    var content = options.content;

    // Update schedule on redraw.
    ctrl.makeSchedule();

    return m("div", { class : css.details },
        m("div", { class : css.start },
            m("p", m("label", { for : "published_at_date" }, "Publish at")),

            m("p", mScheduleInput(content, ctrl, "published_at_date", "start", "date")),
            m("p", mScheduleInput(content, ctrl, "published_at_time", "start", "time"))
        ),
        m("div", { class : css.end },
            m("p", m("label", { for : "unpublished_at_date" }, "Until (optional)")),

            m("p", mScheduleInput(content, ctrl, "unpublished_at_date", "end", "date")),
            m("p", mScheduleInput(content, ctrl, "unpublished_at_time", "end", "time")),
            m("p",
                m("button", {
                    class : css.clearSchedule,
                    title : "Clear schedule dates",

                    // Events
                    onclick : content.clearSchedule.bind(content)
                },
                "clear schedule"
                )
            )
        )
    );
}
