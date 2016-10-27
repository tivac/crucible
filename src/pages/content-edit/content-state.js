import m from "mithril";
import get from "lodash.get";
import set from "lodash.set";
import merge from "lodash.merge";
import sluggo from "sluggo";

import db from "../../lib/firebase";
import * as snapshot from "./lib/transformer-snapshot.js";
import name from "./name.js";
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
            dirty  : boolean,
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
            el     : formEl,
            hidden : array,
            valid  : boolean,

            invalidMessages : array
        },

        fields : {}
    };
}


export default function Content() {
    this.state = new ContentState();
    this.user  = db.getAuth().uid;
    this.ref   = null; // Firebase object reference.

    this.hidden   = new Hidden(this);
    this.schedule = new Schedule(this);
    this.validity = new Validity(this);

    this.init();

    // temp
    window.content = this;
}

Content.prototype = {
    init : function() {        
        this.validity.reset();
    },

    get : function(path) {
        if(!path) {
            return this.state;
        }

        return get(this.state, path);
    },

    // Setup
    setSchema : function(schema, key) {
        this.state.schema = schema;
        this.state.schema.key = key;

        if(!this.state.meta.name) {
            this.state.meta.name = name(schema, {});
        }
    },

    registerForm : function(formEl) {
        this.state.form.el = formEl;
    },

    processServerData : function(data, ref) {
        this.ref = ref; // Firebase reference.

        this.state = merge(this.state, snapshot.toState(data));

        this.validity.checkSchedule();
        this.schedule.updateStatus();
    },


    // Data Changes
    setField : function(path, val) {
        this.state.dates.updated_at = Date.now();
        this.state.user.updated_by  = this.user;
        this.state.meta.dirty = true;

        set(this.state, path, val);
        m.redraw();
    },

    titleChange : function(entryName) {
        this.state.meta.name = entryName;
        this.state.meta.slug = sluggo(entryName);
        this.state.meta.dirty = true;

        m.redraw();
    },

    // UI
    toggleUI : function(key, force) {
        this.state.ui[key] = (force != null) ? Boolean(force) : !this.state.ui[key];
        m.redraw();
    },

    toggleSchedule : function(force) {
        this.toggleUI("schedule", force);
    },

    toggleInvalid : function(force) {
        this.toggleUI("invalid", force);

        if(force) {
            this.validity.debounceFade();
        }
    },

    // Persist
    save : function() {
        var self = this,
            validSave,
            saveData;

        this.toggleSchedule(false);
        validSave = this.validity.isValidSave();

        if(!validSave) {
            this.toggleInvalid(true);

            return null;
        }
        
        this.state.ui.saving  = true;
        this.state.meta.dirty = false;
        m.redraw();

        saveData = snapshot.fromState(this.state);

        return this.ref.update(saveData, function() {
            self.state.ui.saving = false;
            m.redraw();
        });
    }
};


