import m from "mithril";
import format from "date-fns/format";
import assign from "lodash.assign";
import clone from "lodash.clone";
import get from "lodash.get";
import set from "lodash.set";
import merge from "lodash.merge";

import * as schedule from "./transformers/schedule.js";
import * as snapshot from "./transformers/snapshot.js";
// todo wrong section
import Validator from "./delegators/validator.js";

function ContentState() {
    // These are 100% unneccesary, programmatically,
    // they are supposed to make the data object readable.
    var string = null,
        number = null,
        boolean = null,
        object = null,
        array = null,
        formEl = null;

    return {
        meta : {
            id     : string,
            name   : string,
            slug   : string,
            status : string
        },

        schema : object,

        ui : {
            saving   : boolean,
            schedule : boolean,
            invalid  : boolean
        },

        user : {
            created_by : string,
            updated_by : string,

            published_by   : string,
            unpublished_by : string
        },

        dates : {
            created_at : number,
            updated_at : number,

            published_at   : number,
            unpublished_at : number
        },

        schedule : {
            valid : boolean,

            start : {
                date : string,
                time : string
            },

            end : {
                date : string,
                time : string
            }
        },

        form : {
            el : formEl,

            hidden : array,

            valid         : boolean,
            invalidFields : array
        },

        fields : {}
    };
}




export default function Content() {
    var con = this,
        state,
        validator;

    con.state = state = new ContentState();
    con.validator = validator = new Validator(state);
    // TEMP
    console.log("temp make state global for debug");
    window.state = state;

    con.get = function() {
        return clone(state);
    };

    // Setup
    con.setSchema = function(schema) {
        state.schema = schema;
    };

    con.registerForm = function(formEl) {
        con.form = state.form.el = formEl;
        validator.attachInputHandlers(state);
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

    // Transforms
    con.processServerData = function(data) {
        state = merge(state, snapshot.toState(data, state));
        con.assessDerivedVals();
        con.resetInvalid();
    };

    con.setScheduleField = function(side, part, str) {
        state.schedule[side][part] = str;
        state = merge(state, schedule.toTimestamps(state));
        m.redraw();
    };

    con.setField = function(path, val) {
        set(state, path, val);
    };

    con.assessDerivedVals = function() {
        state = merge(state, schedule.fromTimestamps(state));
        m.redraw();
    };

    con.clearSchedule = function() {
        state = merge(state, schedule.clear(state));
        m.redraw();
    };

    con.publish = function(options) {
        state.form.valid = state.form.el.checkValidity();
        console.log("TODO PUBLISH");
    };
    con.save = function() {
        // TODO consider :: content.form.hidden
        console.log("TODO SAVE");
    };
}


