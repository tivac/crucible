
import merge from "lodash.merge";

import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

var STATUS = {
    DRAFT       : "draft",
    SCHEDULED   : "scheduled",
    PUBLISHED   : "published",
    UNPUBLISHED : "unpublished"
};

export default function Schedule(content) {
    var sched = this,
        content = content,
        state = content.state;

    sched.STATUS = STATUS;

    sched.dirty = function() {
        state.meta.dirty = true;
    };

    sched.unpublish = function() {
        var pub = state.dates.published_at,
            unpub = Date.now();

        sched.dirty();
        sched.setDateField("unpublished", unpub);
        if(unpub < pub) {
            sched.setDateField("published", null);
        }

        content.save();
    };

    sched.publish = function() {
        var pub = Date.now(),
            unpub = state.dates.unpublished_at;

        sched.dirty();
        sched.setDateField("published", pub);
        if(unpub < pub) {
            sched.setDateField("unpublished", null);
        }

        content.save();
    };

    sched.setDateField = function(key, ts) {
        var atKey = key + "_at",
            byKey = key + "_by";

        sched.dirty();

        state.dates[atKey] = ts;
        state.user[byKey] = content.user;
        state.meta.status = sched.findStatus(state);

        sched.checkValidity();
    };

    sched.clearSchedule = function() {
        state.meta.dirty = true;
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
        content.validity.checkSchedule();
    };
    
    sched.findStatus = function() {
        var pub = state.dates.published_at,
            unpub = state.dates.unpublished_at,
            status = STATUS.DRAFT;

        if(!pub) {
            return status;
        }

        if(unpub && isPast(unpub)) {
            status = STATUS.UNPUBLISHED;
        } else if(pub && isFuture(pub)) {
            status = STATUS.SCHEDULED;
        } else if(pub && isPast(pub)) {
            status = STATUS.PUBLISHED;
        }

        return status;
    };

    sched.checkValidity = function() {
        state.dates.validSchedule = content.validity.checkSchedule();
        state.meta.status = sched.findStatus();
    };
}
