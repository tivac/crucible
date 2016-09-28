import m from "mithril";
import clone from "lodash.clone";
import _get from "lodash.get";
import set from "lodash.set";
import merge from "lodash.merge";
import sluggo from "sluggo";

import * as snapshot from "./lib/transformer-snapshot.js";
// todo wrong section
import Validator from "./lib/delegator-validator.js";

function ContentState() {
    // These are 100% unneccesary, programmatically,
    // they are supposed to make the data object readable.
    var string = null,
        number = null,
        boolean = null,
        formEl = null,
        object = {},
        array = [];

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
            invalid  : boolean, // Duplication? Or needed for weird fade behavior?

            invalidTransitioning : boolean
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
            unpublished_at : number,
            validSchedule  : boolean
        },

        form : {
            el : formEl,

            hidden : array,

            valid         : boolean, // Duplication? Or needed for weird fade behavior?
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

    con.get = function(path) {
        if(!path) {
            // Superfluous? Will this do more to obscure 
            // potential problems more than prevent them?
            return clone(state);
        }

        return _get(state, path);
    };

    // Setup
    con.setSchema = function(schema, key) {
        state.schema = schema;
        state.schema.key = key;
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

    // UI
    con.toggleSchedule = function(evt, force) {
        state.ui.schedule = (force != null) ? Boolean(force) : !state.ui.schedule;
        m.redraw();
    };

    con.resetInvalid = function() {
        state.form.valid = true;
        state.form.invalidFields = [];
    };

    // Transforms
    con.processServerData = function(data, ref) {
        con.ref = ref; // Firebase reference.

        state = merge(state, snapshot.toState(data, state));
        con.checkValidSchedule();
        con.resetInvalid();
    };

    con.setField = function(path, val) {
        state.dates.updated_at = Date.now();

        return set(state, path, val);
    };

    con.clearSchedule = function() {
        state = merge(state, {
            dates : {
                published_at   : null,
                unpublished_at : null,
                validSchedule  : null
            }
        });
        con.checkValidSchedule();
    };

    // Hidden / Dependent fields.
    con.getHiddenIndex = function(key) {
        return state.form.hidden.indexOf(key);
    };

    con.addHidden = function(key) {
        state.form.hidden.push(key);
    };

    con.removeHidden = function(key) {
        var index = con.getHiddenIndex(key);

        if(index > -1) {
            state.form.hidden.splice(index, 1);
        }
    };

    // Validity / Publishing
    con.checkValidSchedule = function() {
        state.dates.validSchedule = validator.validSchedule();
    };

    con.setDateField = function(key, ts) {
        state.dates[key] = ts;
        con.checkValidSchedule();
    };

    con.publish = function() {
        state.form.valid = state.form.el.checkValidity();

        if(!state.form.valid) {
            return;
        }

        con.setDateField("published_at", Date.now());
        con.checkValidSchedule();
    };

    con.unpublish = function() {
        con.setDateField("unpublished_at", Date.now());
        con.checkValidSchedule();
    };

    // Persist
    con.save = function() {
        var saveData;

        if(!state.dates.validSchedule) {
            console.log("TODO user feedback for invalid schedule.");
            state.form.invalidFields = ["Invalid schedule."];
            state.ui.invalid = true;
            return;
        }
        
        state.ui.saving = true;
        m.redraw();

        saveData = snapshot.fromState(state);

        con.ref.update(saveData, function() {
            state.ui.saving = false;
            m.redraw();
        });
    };
}


