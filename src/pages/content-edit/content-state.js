import m from "mithril";
import _get from "lodash.get";
import set from "lodash.set";
import merge from "lodash.merge";

import * as snapshot from "./lib/transformer-snapshot.js";
import Validator from "./lib/delegator-validator.js";
import db from "../../lib/firebase";

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

    con.state = null;
    con.validator = null;

    con.user = db.getAuth().uid;

    con.init = function() {
        con.state = state = new ContentState();
        con.validator = validator = new Validator(con);
      
        // TEMP
        console.log("temp make state global for debug");
        window.state = state;
    };

    con.get = function(path) {
        if(!path) {
            return state;
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


    // UI
    con.toggleSchedule = function(evt, force) {
        state.ui.schedule = (force != null) ? Boolean(force) : !state.ui.schedule;
        m.redraw();
    };

    // Transforms
    con.processServerData = function(data, ref) {
        con.ref = ref; // Firebase reference.

        state = merge(state, snapshot.toState(data, state));
        con.checkValidSchedule();
        con.resetInvalid();
    };

    // Data Changes
    con.titleChange = function(name) {
        // console.log("state.meta.title", state.meta.title);
        state.meta.name = name;
        m.redraw();
    };

    con.setField = function(path, val) {
        state.dates.updated_at = Date.now();
        state.user.updated_by = con.user;

        return set(state, path, val);
    };

    con.clearSchedule = function() {
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
    con.addInvalid = function(name) {
        state.form.valid = false;
        
        if(state.form.invalidFields.indexOf(name) > -1) {
            return;
        }
        state.form.invalidFields.push(name);
    };

    con.resetInvalid = function() {
        state.form.valid = true;
        state.form.invalidFields = [];
    };

    con.checkValidSchedule = function() {
        state.dates.validSchedule = validator.validSchedule();
    };

    con.setDateField = function(key, ts) {
        var atKey = key + "_at",
            byKey = key + "_by";

        state.dates[atKey] = ts;
        state.user[byKey] = con.user;

        con.checkValidSchedule();
    };

    con.publish = function() {
        state.form.valid = state.form.el.checkValidity();

        console.log("state.form.valid", state.form.valid);
        if(!state.form.valid) {
            return;
        }

        con.setDateField("published", Date.now());

        if(state.dates.unpublished_at < state.dates.published_at) {
            con.setDateField("unpublished", null);
        }
    };

    con.unpublish = function() {
        con.setDateField("unpublished", Date.now());
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

    con.init();
}


