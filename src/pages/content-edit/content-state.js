import m from "mithril";
import _get from "lodash.get";
import set from "lodash.set";
import merge from "lodash.merge";

import db from "../../lib/firebase";
import * as snapshot from "./lib/transformer-snapshot.js";
import Hidden from "./lib/delegator-hidden.js";
import Schedule from "./lib/delegator-schedule.js";
import Validity from "./lib/delegator-validity.js";

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
    // UI jitter before firebase response.

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
        hidden,
        schedule,
        validity;

    con.state = null;
    con.user = db.getAuth().uid;
    con.ref = null; // Firebase object reference.

    con.hidden = null;
    con.schedule = null;
    con.validity = null;

    con.init = function() {
        con.state = state = new ContentState();

        con.hidden = hidden = new Hidden(con);
        con.schedule = schedule = new Schedule(con);
        con.validity = validity = new Validity(con);
      
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

    con.processServerData = function(data, ref) {
        con.ref = ref; // Firebase reference.

        state = merge(state, snapshot.toState(data));
        state.meta.status = schedule.findStatus();
        con.validity.checkSchedule();
        con.validity.reset();
    };


    // Data Changes
    con.setField = function(path, val) {
        state.dates.updated_at = Date.now();
        state.user.updated_by = con.user;

        return set(state, path, val);
    };

    con.titleChange = function(name) {
        state.meta.name = name;
        m.redraw();
    };


    // UI
    function toggleUI(key, force) {
        state.ui[key] = (force != null) ? Boolean(force) : !state.ui[key];
        m.redraw();
    }

    con.toggleSchedule = function(force) {
        toggleUI("schedule", force);
    };

    con.toggleInvalid = function(force) {
        toggleUI("invalid", force);
    };

    // Persist
    con.save = function() {
        var STATUS = schedule.STATUS,
            requiresValid,
            saveData;

        con.schedule.checkValidity();
        con.toggleSchedule(false);

        requiresValid = [ STATUS.SCHEDULED, STATUS.PUBLISHED ].indexOf(state.meta.status) > 1;
        if(requiresValid) {
            con.validity.checkForm();
        }

        if(!state.dates.validSchedule) {
            state.form.invalidFields = [ "Invalid schedule." ];
            con.toggleInvalid(true);
            validity.debounceFade();

            return null;
        }

        console.log("requiresValid", requiresValid);
        console.log("state.form.valid", state.form.valid);
        if(!state.form.valid && requiresValid) {
            return null;
        }
        
        state.ui.saving = true;
        m.redraw();

        saveData = snapshot.fromState(state);

        return con.ref.update(saveData, function() {
            state.ui.saving = false;
            m.redraw();
        });
    };

    con.init();
}


