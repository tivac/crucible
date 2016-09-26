import merge from "lodash.merge";

import * as schedule from "./schedule.js";

export function toState(data) {
    var result =  {
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

    result = merge(result, schedule.fromTimestamps(result));

    return result;
}

export function fromState(state) {
//     var dates = state.dates,
//         meta = state.meta;

//     return {
//         name : meta.name,
//         slug : meta.slug,

//         created_at : dates.created_at,
//         updated_at : Date.now(),
//         published_at : dates.published_at,
//         unpublished_at : dates.unpublished_at,

//         created_by : meta.created_by,
//         updated_by : meta.created_by,
//         published_by : meta.published_by,
//         unpublished_by : meta.unpublished_by,

//         fields : state.fields
//     };
}
