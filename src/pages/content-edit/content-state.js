import m from "mithril";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import clone from "lodash.clone";
import _get from "lodash.get";
import set from "lodash.set";
import merge from "lodash.merge";

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
            unpublished_at : number,
            validSchedule  : boolean
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

    con.get = function(path) {
        if(!path) {
            return clone(state);
            // return state;
        }

        return _get(state, path);
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
    con.processServerData = function(data, ref) {
        con.ref = ref; // Firebase reference.

        state = merge(state, snapshot.toState(data, state));
        con.assessDerivedVals();
        con.resetInvalid();
    };

    con.setField = function(path, val) {
        state.dates.updated_at = Date.now();

        return set(state, path, val);
    };

    con.assessDerivedVals = function() {
        state.dates.validSchedule = validator.validSchedule();
        m.redraw();
    };

    con.findStatus = function() {
        var pub = state.dates.published_at,
            unpub = state.dates.unpublished_at,
            status = "draft";

        if(isFuture(pub)) {
            status = "scheduled";
        } else if(isPast(pub)) {
            status = "published";
        } else if(isPast(unpub)) {
            status = "unpublished";
        }

        return status;
    };

    con.clearSchedule = function() {
        state = merge(state, {
            dates : {
                published_at   : null,
                unpublished_at : null,
                validSchedule  : null
            }
        });
        m.redraw();
    };

    con.publish = function() {
        state.form.valid = state.form.el.checkValidity();

        if(!state.form.valid) {
            return;
        }

        state = merge(state, {
            dates : { published_at : Date.now() } 
        });
        state.dates.validSchedule = validator.validSchedule();
        m.redraw();
    };

    con.unpublish = function() {
        state = merge(state, {
            dates : { unpublished_at : Date.now() } 
        });
        state.dates.validSchedule = validator.validSchedule();
        // m.redraw();
    };

    con.save = function() {
        var saveData;

        if(!state.dates.validSchedule) {
            console.log("TODO user feedback for invalid schedule.");
            return;
        }

        // TODO consider :: content.form.hidden
        console.log("TODO SAVE");
        
        state.ui.saving = true;
        m.redraw();

        saveData = snapshot.fromState(state);

        return con.ref.update(saveData, function() {
            state.ui.saving = false;
            m.redraw();
        });
    };
}


