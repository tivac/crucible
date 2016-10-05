
import merge from "lodash.merge";

import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

export default function Schedule(content) {
    this.content = content;
}

Schedule.prototype = {
    STATUS : {
        DRAFT       : "draft",
        SCHEDULED   : "scheduled",
        PUBLISHED   : "published",
        UNPUBLISHED : "unpublished"
    },

    dirty : function() {
        var state = this.content.get();

        state.meta.dirty = true;
    },

    unpublish : function() {
        var state = this.content.get(),
            pub   = state.dates.published_at,
            unpub = Date.now();

        this.dirty();
        this.setDateField("unpublished", unpub);

        if(unpub < pub) {
            this.setDateField("published", null);
        }

        this.content.save();
    },

    publish : function() {
        var state = this.content.get(),
            pub   = Date.now(),
            unpub = state.dates.unpublished_at;

        this.dirty();
        this.setDateField("published", pub);
        
        if(unpub < pub) {
            this.setDateField("unpublished", null);
        }

        this.content.save();
    },

    setDateField : function(key, ts) {
        var state = this.content.get(),
            atKey = key + "_at",
            byKey = key + "_by";

        this.dirty();

        state.dates[atKey] = ts;
        state.user[byKey] = this.content.user;

        this.updateStatus(state);
        this.content.validity.checkSchedule();
    },

    clearSchedule : function() {
        var state = this.content.get();
            
        this.dirty();

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

        this.content.validity.checkSchedule();
    },
    
    updateStatus : function() {
        var state  = this.content.get(),
            pub    = state.dates.published_at,
            unpub  = state.dates.unpublished_at,
            status = this.STATUS.DRAFT;

        if(!pub) {
            state.meta.status = status;

            return;
        }

        if(unpub && isPast(unpub)) {
            status = this.STATUS.UNPUBLISHED;
        } else if(pub && isFuture(pub)) {
            status = this.STATUS.SCHEDULED;
        } else if(pub && isPast(pub)) {
            status = this.STATUS.PUBLISHED;
        }

        state.meta.status = status;
    }
};
