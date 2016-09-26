import m from "mithril";
import format from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import subSeconds from "date-fns/sub_seconds";
import get from "lodash.get";
import clone from "lodash.clone";

import config, { icons } from "../../config";
import db from "../../lib/firebase";
import prefix from "../../lib/prefix";

import * as invalidMsg from "./invalid-msg.js";

import css from "./head.css";

function filterHidden(fields, hidden) {
    // People can hide/unhide a field without losing work.
    // But we don't want to persist data from hidden fields,
    // so overwrite the data to be saved, but clone the 
    // source data so we do not modify the form's data.
    var filtered = clone(fields);

    Object.keys(filtered).forEach(function(key) {
        if(hidden.indexOf(key) > -1) {
            filtered[key] = null;
        }
    });

    return filtered;
}

// export function controller(options) {
//     var ctrl = this,
//         ref  = options.ref,
//         user = db.getAuth().uid,

//         publishTs   = options.data.published_at ? options.data.published_at : null,
//         unpublishTs = options.data.unpublished_at ? options.data.unpublished_at : null,

//         defaultStartTime = get(config, "defaults.publish_start_time") || DEFAULT_START_TIME,
//         defaultEndTime   = get(config, "defaults.publish_end_time")   || DEFAULT_END_TIME;

//     ctrl.init = function() {
//         ctrl.schedule   = false;

//         ctrl.start = (publishTs) ? makeScheduleObj(publishTs) : nulledDate(defaultStartTime);
//         ctrl.end   = (unpublishTs) ? makeScheduleObj(unpublishTs) : nulledDate(defaultEndTime);

//         ctrl.recalculateTimestamps();
//     };

//     // Event handlers
//     ctrl.update = function(section, field, value) {
//         ctrl[section][field] = value;

//         if(section === "start" || section === "end") {
//             ctrl.recalculateTimestamps();
//         }
//     };

//     ctrl.toggle = function(force) {
//         ctrl.schedule = typeof force !== "undefined" ? Boolean(force) : !ctrl.schedule;
//     };

//     ctrl.publish = function(opts) {
//         var self = ctrl,
//             startTs,
//             updated,
//             pubDateIsPast,
//             hasUnpubDate,
//             unpubDateIsFuture;

//         // This check will also trigger the Validator which
//         // is listening for each input's "invalid" event.
//         if(!opts.form.checkValidity()) {
//             return null;
//         }

//         pubDateIsPast = Boolean(ctrl.start.ts) && isPast(ctrl.start.ts);

//         hasUnpubDate  = Boolean(ctrl.end.ts);
//         unpubDateIsFuture = hasUnpubDate && isFuture(ctrl.end.ts);

//         if(pubDateIsPast && (unpubDateIsFuture || !hasUnpubDate)) {
//             // Already currently published.
//             return;
//         }

//         ctrl.saving = true;
//         m.redraw();

//         startTs = subSeconds(Date.now(), 10);
//         ctrl.start = makeScheduleObj(startTs);

//         updated = {
//             published_at : startTs,
//             published_by : user
//         };

//         if(ctrl.end.ts && (ctrl.start.ts > ctrl.end.ts)) {
//             ctrl.end = nulledDate(defaultEndTime);

//             updated.unpublished_at = null;
//             updated.unpublished_by = null;

//             console.warn("Invalid end date. Resetting end date.");
//         }

//         return ref.update(updated, function() {
//             ctrl.saving = false;
//             m.redraw();
//         });
//     };

//     ctrl.unpublish = function() {
//         var nowTs,
//             updated;

//         if(ctrl.end.ts && isPast(ctrl.end.ts)) {
//             // Already unpublished.
//             return;
//         }

//         ctrl.saving = true;
//         m.redraw();

//         nowTs = Date.now();
//         ctrl.end = makeScheduleObj(nowTs);

//         updated = {
//             unpublished_at : nowTs,
//             unpublished_by : user
//         };

//         if(ctrl.start.ts &&  ctrl.start.ts > ctrl.end.ts) {
//             // Invalid start.
//             ctrl.start = nulledDate(defaultStartTime);
//         }

//         ref.update(updated, function() {
//             ctrl.saving = false;
//             m.redraw();
//         });
//     };

//     ctrl.clearSchedule = function() {
//         ctrl.start = nulledDate(defaultStartTime);
//         ctrl.end   = nulledDate(defaultEndTime);
//         ctrl.invalidDates = false;
//     };

//     ctrl.save = function(opts) {
//         var updated = {};

//         ctrl.saving = true;
//         m.redraw();

//         updated = {
//             fields : filterHidden( opts.data.fields, opts.hidden ),
//             name   : opts.data.name,
//             slug   : opts.data.slug || null
//         };

//         updated = ctrl.addScheduleData(updated);

//         return ref.update(updated, function() {
//             ctrl.saving = false;
//             m.redraw();
//         });
//     };

//     ctrl.addScheduleData = function(updated) {
//         var startTs = null,
//             endTs = null,
//             startTime = ctrl.start.time || DEFAULT_START_TIME,
//             endTime = ctrl.end.time || DEFAULT_END_TIME;

//         if(ctrl.invalidDates) {
//             return updated;
//         }

//         if(ctrl.start.date) {
//             startTs = getTimestampFromStr(ctrl.start.date + " " + startTime);
//         }

//         if(ctrl.end.date) {
//             endTs = getTimestampFromStr(ctrl.end.date + " " + endTime);
//         }

//         updated.published_at = startTs;
//         updated.unpublished_at = endTs;

//         if(options.data.published_at && !updated.published_at) {
//             // Publish date was removed. Null it out.
//             updated.published_at = null;
//             updated.published_by = null;

//             ctrl.start = nulledDate(defaultStartTime);
//         }

//         if(options.data.unpublished_at && !updated.unpublished_at) {
//             // Unpublish date was removed. Null it out.
//             updated.unpublished_at = null;
//             updated.unpublished_by = null;

//             ctrl.end = nulledDate(defaultEndTime);
//         }

//         return updated;
//     };


//     ctrl.recalculateTimestamps = function() {
//         var start = ctrl.start,
//             end = ctrl.end;

//         if(start.date) {
//             start.ts = getTimestampFromStr(start.date + " " + start.time);
//         }
//         if(end.date) {
//             end.ts = getTimestampFromStr(end.date + " " + end.time);
//         }

//         if(start.date && end.date) {
//             ctrl.invalidDates = (start.ts > end.ts);
//         }
//     };  

//     ctrl.init();
// }

export function view(ctrl, options) {
    var content = options.content,
        state = content.get(),
        publishTs = state.dates.published_at,
        unpublishTs = state.dates.unpublished_at,
        future  = isFuture(publishTs),
        locked  = config.locked;

    // TEMP to find bad old code
    var ctrl = null;

    function scheduleInput(id, type, side, part) {
        
        // console.log("state.schedule.start", state.schedule.start);
        // console.log("state.schedule.end", state.schedule.end);
        // console.log("state.schedule, side, part", side, part);
        // console.log("state.schedule[side][part]", state.schedule[side][part]);
        
        return m("input", {
            class : state.schedule.valid ? css.date : css.invalidDate,
            type  : type,
            id    : id,
            value : state.schedule[side][part],

            // Events
            oninput : m.withAttr("value", content.setScheduleField.bind(content, side, part))
        });
    }

    // TODO Better implementation.
    // if(ctrl.start.ts && isPast(ctrl.start.ts)) {
    //     isDisabled = true;
    // }
    // TODO Better implementation.
    // if(ctrl.end.ts && isPast(ctrl.end.ts)) {
    //     isDisabled = true;
    // }

    return m("div", { class : css.head },
        m("div", { class : css.main },

            // Controls
            m("div", { class : css.actions }, [
                m("a", {
                        // Attrs
                        class  : css.back,
                        title  : "Back to Listing",
                        href   : prefix("/listing/" + state.schema.key),
                        config : m.route
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#arrow" })
                    ),
                    "Back"
                ),

                m("button", {
                        // Attrs
                        class    : css.save,
                        title    : "Save your changes",
                        disabled : locked || null,

                        // Events
                        onclick : state.ui.saving ? null : content.save.bind(null, state)
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#save" })
                    ),
                    state.ui.saving ? "SAVING..." : "Save"
                )
            ]),

            // Publishing
            m("div", { class : css.publishing },
                // Schedule
                m("button", {
                        // Attrs
                        class : css.schedule,
                        title : "Schedule a publish",

                        // Events
                        onclick : content.toggleSchedule
                    },
                    m("svg", { class : css.onlyIcon },
                        m("use", { href : icons + "#schedule" })
                    )
                ),

                // Publish
                m("div", { class : css.publishContainer },
                    m("button", {
                            // Attrs
                            class    : css.publish,
                            title    : future ? "Schedule publish" : "Already published",
                            disabled : locked || null,

                            // Events
                            onclick : content.publish.bind(null, options)
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : icons + (future ? "#schedule" : "#publish") })
                        ),
                        future ? "Schedule" : "Publish"
                    ),
                    !state.form ?
                        null :
                        m.component(invalidMsg, { content : content }) 
                ),

                // Unpublish
                (state.meta.status === "draft") ?
                null :
                m("button", {
                        // Attrs
                        class    : css.unpublish,
                        title    : isPast(unpublishTs) ? "Already unpublished" : "Unpublish immediately",
                        disabled : locked || null,

                        // Events
                        // onclick : ctrl.unpublish
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#remove" })
                    ),
                    "Unpublish"
                )
            ),

            // Schedule Pop Up
            (!state.ui.schedule) ?
            null :
            m("div", { class : css.details },
                m("div", { class : css.start },
                    m("p", m("label", { for : "published_at_date" }, "Publish at")),

                    m("p", scheduleInput("published_at_date", "date", "start", "date")),
                    m("p", scheduleInput("published_at_time", "time", "start", "time"))
                ),
                m("div", { class : css.end },
                    m("p", m("label", { for : "unpublished_at_date" }, "Until (optional)")),

                    m("p", scheduleInput("unpublished_at_date", "date", "end", "date")),
                    m("p", scheduleInput("unpublished_at_time", "time", "end", "time")),
                    m("p",
                        m("button", {
                            class : css.clearSchedule,
                            title : "Clear schedule dates",

                            // Events
                            onclick : content.clearSchedule
                        },
                        "clear schedule"
                        )
                    )
                )
            )
        )
    );
}
