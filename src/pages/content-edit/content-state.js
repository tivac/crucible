import m from "mithril";
import format from "date-fns/format";
import assign from "lodash.assign";
import clone from "lodash.clone";
import get from "lodash.get";
import merge from "lodash.merge";

import { processSchedule, transformSchedule } from "./transformers/dates.js";

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
        saving : Boolean(),

        schedule : Boolean()
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
        el : document.createElement("form"),

        hiddenFields : [],

        valid         : Boolean(),
        invalidFields : []
    },

    fields : {}
};

if(Object.preventExtensions) {
    Object.preventExtensions(contentState);
}

function transformSnapshot(val) {
    // var val = snap.val();

    return merge(contentState, {
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

        fields : val.fields
    });
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

export default function Content() {
    var state = contentState;

    this.get = function() {
        return clone(state);
    };

    // Setup
    this.registerForm = function(formEl) {
        this.form = state.form.el = formEl;
    };
    this.processServerData = function(data) {
        state = transformSnapshot(data);
    };
    this.addSchemaData = function(schema) {
        state = merge(state, {
            meta : {
                schema    : schema,
                schemaKey : schema.key
            }
        });
    };

    // Data Changes
    this.titleChange = function(title) {
        state.meta.title = title;
        m.redraw();
    };

    this.toggleSchedule = function(force) {
        console.log("toggleSchedule");
        state.ui.schedule = typeof force !== "undefined" ? Boolean(force) : !state.ui.schedule;
        m.redraw();
    };

    this.resetInvalid = function() {
        state.form.valid = true;
        state.form.invalidFields = [];
    };

    this.setSchedule = function(str, side, part) {
        state.schedule[side][part] = str;
        state = processSchedule(state);
        m.redraw();
    };

    this.save = function(a,b,c) {
        console.log("TODO SAVE");
    };
}


