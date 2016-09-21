
import format from "date-fns/format";
import get from "lodash.get";
import merge from "lodash.merge";
import assign from "lodash.assign";

import { processSchedule, transformSchedule } from "./content-dates.js";

var contentState = {
    meta : {
        id : String(),

        name : String(),
        slug : String(),

        status : String(),

        schema    : {},
        schemaKey : String()
    },

    ui : {
        saving : Boolean()
    },

    user : {
        created_by : String(),
        updated_by : String(),

        published_by   : String(),
        unpublished_by : String()
    },

    dates : {
        created_at : Number(),
        updated_at : Number(),

        published_at   : Number(),
        unpublished_at : Number()
    },

    schedule : {
        valid : Boolean(),

        start : {
            date : String(),
            time : String()
        },

        end : {
            date : String(),
            time : String()
        }
    },

    form : {
        valid : Boolean(),

        invalidFields : [],
        hiddenFields  : []
    },

    fields : {}
};

function transform(val) {
    // var val = snap.val();

    return {
        meta : {
            name : val.name,
            slug : val.slug
        },

        user : {
            created_by : val.created_by,
            updated_by : val.updated_by,

            published_by   : val.published_by,
            unpublished_by : val.unpublished_by
        },

        dates : {
            created_at : val.created_at,
            updated_at : val.updated_at,

            published_at   : val.published_at,
            unpublished_at : val.unpublished_at
        },

        schedule : transformSchedule({
            pub   : val.published_at, 
            unpub : val.unpublished_at
        }),

        fields : val.fields,

        form : {
            valid : false,

            invalidFields : [],
            hiddenFields  : []
        }
    };
}

// function unTransform(state) {
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
// }

export default function ContentMgr() {
    var state = contentState;

    this.processServerData = function(data) {
        state = transform(data);
    };

    this.addSchemaData = function(schema) {
        state = merge(state, {
            meta : {
                schema    : schema,
                schemaKey : schema.key
            }
        });
    };

    this.setSchedule = function(str, side, part) {
        state.schedule[side][part] = str;

        state = processSchedule(state);
    };

    this.setForm = function(el) {
        this.form = el;
    };

    this.save = function(a,b,c) {
        console.log("TODO SAVE");

    };
}


