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

    // A few values are set to defaults to avoid 
    // UI jitter on firebase response.

    return {
        meta : {
            id     : string,
            name   : string,
            slug   : string,
            status : "draft"
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
            validSchedule  : true
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
    };


    // UI
    con.toggleUI = function(key, force) {
        state.ui[key] = (force != null) ? Boolean(force) : !state.ui[key];
        m.redraw();
    };

    con.toggleSchedule = function(force) {
        con.toggleUI("schedule", force);
    };

    con.toggleInvalid = function(force) {
        con.toggleUI("invalid", force);
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
    function getHiddenIndex(key) {
        return state.form.hidden.indexOf(key);
    }

    con.addHidden = function(key) {
        var index = getHiddenIndex(key);

        if(index === -1) { 
            state.form.hidden.push(key);
        }
    };

    con.removeHidden = function(key) {
        var index = getHiddenIndex(key);

        if(index > -1) {
            state.form.hidden.splice(index, 1);
        }
    };

    // Validity / Publishing
    con.addInvalidField = function(name) {        
        if(state.form.invalidFields.indexOf(name) > -1) {
            return;
        }
        state.form.invalidFields.push(name);
    };

    con.resetInvalid = function() {
        state.form.invalidFields = [];
    };

    con.checkValidSchedule = function() {
        state.dates.validSchedule = validator.validSchedule(state);
    };

    con.setDateField = function(key, ts) {
        var atKey = key + "_at",
            byKey = key + "_by";

        state.dates[atKey] = ts;
        state.user[byKey] = con.user;
        state.meta.status = snapshot.findStatus(state);

        con.checkValidSchedule();
    };

    con.unpublish = function() {
        con.setDateField("unpublished", Date.now());
    };

    con.publish = function() {
        state.form.valid = validator.checkValidity();

        if(!state.form.valid) {
            return;
        }

        con.setDateField("published", Date.now());

        if(state.dates.unpublished_at < state.dates.published_at) {
            con.setDateField("unpublished", null);
        }
    };


    // Persist
    con.save = function() {
        var saveData;

        if(!state.dates.validSchedule) {
            state.form.invalidFields = [ "Invalid schedule." ];
            con.toggleInvalid(true);
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


