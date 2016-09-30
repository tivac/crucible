
import clone from "lodash.clone";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

export function findStatus(state) {
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
}

export function toState(data) {
    var result = {
        meta : {
            name : data.name,
            slug : data.slug
        },

        user : {
            created_by : data.created_by,
            updated_by : data.updated_by,

            published_by   : data.published_by,
            unpublished_by : data.unpublished_by
        },

        dates : {
            created_at : data.created_at,
            updated_at : data.updated_at,

            published_at   : data.published_at,
            unpublished_at : data.unpublished_at
        },

        fields : data.fields
    };

    result.meta.status = findStatus(result);

    return result;
}


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

export function fromState(state) {
    var dates = state.dates,
        user = state.user,
        meta = state.meta;

    return {
        name : meta.name,
        slug : meta.slug,

        created_at : dates.created_at,
        updated_at : Date.now(),

        published_at   : dates.published_at,
        unpublished_at : dates.unpublished_at,

        created_by : user.created_by,
        updated_by : user.created_by,

        published_by   : user.published_by,
        unpublished_by : user.unpublished_by,

        fields : filterHidden(state.fields, state.form.hidden)
    };
}
