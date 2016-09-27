
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

