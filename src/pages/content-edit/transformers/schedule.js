
import get from "lodash.get";
import merge from "lodash.merge";
import assign from "lodash.assign";

import formatDate from "date-fns/format";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import subSeconds from "date-fns/sub_seconds";

var DEFAULT_START_TIME = "00:00",
    DEFAULT_END_TIME   = "23:59",
    DATE_FORMAT = "YYYY-MM-DD",
    TIME_FORMAT = "HH:mm",
    TIMESTAMP_FORMAT = "x"

    ;

function status(pub, unpub) {
    if(isFuture(pub)) {
        return "scheduled";
    } else if(isPast(pub)) {
        return "published";
    } else if(isPast(unpub)) {
        return "unpublished";
    }
}

function scheduleStr(side, day, time) {
    if(!day) {
        return null;
    }

    if(!time) {
        time = side === "start" ? DEFAULT_START_TIME : DEFAULT_END_TIME;
    }

    return day + " " + time;
}

function timestampFromStr(str) {
    return parseInt(formatDate(str, TIMESTAMP_FORMAT), 10);
}

function timestamp(side, day, time) {
    var str = scheduleStr(side, day, time);

    return str ? timestampFromStr(str) : null;
}

function validSchedule(pub, unpub) {
    return (pub && !unpub) ||
        (unpub && !pub) ||
        (pub && unpub && pub > unpub);
}

export default {};

export function toTimestamps(state) {
    var sched = state.schedule,
        prevPub = state.published_at,
        prevUnpub = state.unpublished_at,
        valid = true,
        pub,
        unpub;

    try {
        pub   = timestamp("start", sched.start.date, sched.start.time);
        unpub = timestamp("end",   sched.end.date,   sched.end.time);
    } catch(e) {
        valid = false;
    }

    valid = valid && validSchedule(pub, unpub);
    pub   = pub ? pub : prevPub;
    unpub = unpub ? unpub : prevUnpub;

    return {
        meta : {
            status : status(pub, unpub)
        },
        dates : {
            updated_at : Date.now(),

            published_at   : pub,
            unpublished_at : unpub
        },

        schedule : {
            valid : valid
        }
    };
}

export function fromTimestamps(state) {
    var pub = state.dates.published_at,
        unpub = state.dates.unpublished_at;

    return {
        schedule : {
            valid : validSchedule(pub, unpub),

            start : {
                date : pub ? formatDate(pub, DATE_FORMAT) : "",
                time : pub ? formatDate(pub, TIME_FORMAT) : DEFAULT_START_TIME
            },

            end : {
                date : unpub ? formatDate(unpub, DATE_FORMAT) : "",
                time : unpub ? formatDate(unpub, TIME_FORMAT) : DEFAULT_END_TIME
            }
        }
    };
}

export function clear(state) {
    return {
        schedule : {
            valid : true,

            start : {
                date : "",
                time : DEFAULT_START_TIME
            },

            end : {
                date : "",
                time : DEFAULT_END_TIME
            }
        }
    };
}
