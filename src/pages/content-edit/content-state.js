import m from "mithril";
import format from "date-fns/format";
import assign from "lodash.assign";
import clone from "lodash.clone";
import get from "lodash.get";
import merge from "lodash.merge";

import * as schedule from "./transformers/schedule.js";
import * as snapshot from "./transformers/snapshot.js";

var contentState = {
    meta : {
        id   : String(),
        name : String(),
        slug : String(),

        status : String(),

        schema : {}
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


export default function Content() {
    var con = this,
        state = contentState;

    con.get = function() {
        return clone(state);
    };

    // Setup
    con.setSchema = function(schema) {
        state.meta.schema = schema;
    };
    con.registerForm = function(formEl) {
        con.form = state.form.el = formEl;
    };
    con.processServerData = function(data) {
        state = snapshot.toState(data, state);
        con.assessDerivedVals();
    };
    con.assessDerivedVals = function() {
        state = schedule.fromTimestamps(state);
    };

    con.addSchemaData = function(schema) {
        state = merge(state, {
            meta : {
                schema    : schema,
                schemaKey : schema.key
            }
        });
    };

    // Data Changes
    con.titleChange = function(title) {
        state.meta.title = title;
        m.redraw();
    };

    con.toggleSchedule = function(evt, force) {
        state.ui.schedule = typeof force !== "undefined" ? Boolean(force) : !state.ui.schedule;
        m.redraw();
    };

    con.resetInvalid = function() {
        state.form.valid = true;
        state.form.invalidFields = [];
    };

    con.setScheduleField = function(side, part, str) {
        state.schedule[side][part] = str;

        state = schedule.toTimestamps(state);

        m.redraw();
    };

    con.clearSchedule = function() {
        state = schedule.clear(state);
    };

    con.save = function() {
        console.log("TODO SAVE");
    };
}


