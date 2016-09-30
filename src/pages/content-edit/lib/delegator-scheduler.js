
import merge from "lodash.merge";

import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

export default function Scheduler(content) {
    var sched = this,
        con = content,
        state = content.state;

    sched.unpublish = function() {
        con.setDateField("unpublished", Date.now());
    };

    sched.publish = function() {
        state.form.valid = con.validator.checkValidity();

        if(!state.form.valid) {
            return;
        }

        con.setDateField("published", Date.now());

        if(state.dates.unpublished_at < state.dates.published_at) {
            con.setDateField("unpublished", null);
        }
    };

    sched.setDateField = function(key, ts) {
        var atKey = key + "_at",
            byKey = key + "_by";

        state.dates[atKey] = ts;
        state.user[byKey] = con.user;
        state.meta.status = sched.findStatus(state);

        con.checkValidSchedule();
    };

    sched.clearSchedule = function() {
        state = merge(state, {
            user : {
                published_by   : null,
                unpublished_by : null
            },
            dates : {
                published_at   : null,
                unpublished_at : null,
                validSchedule  : null
            }
        });
        con.checkValidSchedule();
    };
    
    sched.findStatus = function() {
        var pub = state.dates.published_at,
            unpub = state.dates.unpublished_at,
            status = "draft";

        if(!pub) {
            return status;
        }

        if(unpub && isPast(unpub)) {
            status = "unpublished";
        } else if(pub && isFuture(pub)) {
            status = "scheduled";
        } else if(pub && isPast(pub)) {
            status = "published";
        }

        return status;
    };

    sched.checkValidSchedule = function() {
        state.dates.validSchedule = con.validator.validSchedule(state);
        state.meta.status = sched.findStatus(state);
    };
}
