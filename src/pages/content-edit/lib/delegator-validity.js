import m from "mithril";
import debounce from "lodash.debounce";

import css from "../invalid-msg.css";

function reqPrefix(name) {
    return "Required: " + name;
}

export default function Validity(content) {
    var v = this;
        content = content;

    v.handlersAttached = false;

    // Private functions.
    function show() {
        var wasInvalid = content.get().ui.invalid;

        content.toggleInvalid(true);
        if(!wasInvalid) {
            m.redraw(); // Only do once; avoid superfluous redraws.
        }
    }

    function hide() {            
        // CSS transition does the rest.
        content.toggleInvalid(false);
        m.redraw();
    }

    v.debounceFade = debounce(function() {
        hide.call(v);
    }, 100);

    v.attachInputHandlers = function() {
        var form = content.get().form.el;

        if(v.handlersAttached) {
            return;
        }
        v.handlersAttached = true;

        // Irritatingly, this attachment had to be delayed like this because the 
        // form's `config` function was running before the whole DOM tree was rendered,
        // so we were getting an incomplete list of inputs previously.
        form.querySelectorAll("input, textarea, select").forEach(function(formInput) {
            formInput.addEventListener("invalid", function(evt) {
                evt.target.classList.add(css.highlightInvalid);
                v.registerInvalidField(evt.target.name);
            });

            formInput.addEventListener("focus", function(evt) {
                evt.target.classList.remove(css.highlightInvalid);
                v.onFormFocus(evt); // focus doesn't bubble, so we listen to all the inputs for this.
            });
        });
    };

    v.checkForm = function() {
        var state = content.get();

        v.attachInputHandlers();
        state.form.valid = state.form.el.checkValidity();

        return state.form.valid;
    };

    v.registerInvalidField = function(name) {
        v.addInvalidField(name);
        show();
        v.debounceFade();
    };

    v.addInvalidField = function(name) {
        var prefixedName = reqPrefix(name);

        v.addInvalidMessage(prefixedName);
    };

    v.addInvalidMessage = function(msg) {
        var state = content.get();
           
        if(state.form.invalidMessages.indexOf(msg) > -1) {
            return;
        }
        state.form.invalidMessages.push(msg);
    };

    v.reset = function() {
        var state = content.get();

        state.form.valid = true;
        state.form.invalidMessages = [];
    };

    v.onFormFocus = function() {
        if(!content.get().form.valid) {
            v.debounceFade();
        }
    };

    v.checkSchedule = function() {
        var state = content.get(),
            pub = state.dates.published_at,
            unpub = state.dates.unpublished_at;

        return (!pub && !unpub) ||
            (pub && !unpub) ||
            (unpub && !pub) ||
            (pub && unpub && pub < unpub);
    };

    v.isValidSave = function() {
        var STATUS = content.schedule.STATUS,
            state = content.get(),
            isValid = true,
            requiresValid;

        state.meta.status = content.schedule.findStatus();

        requiresValid = [ STATUS.SCHEDULED, STATUS.PUBLISHED ].indexOf(state.meta.status) > -1;
        if(requiresValid) {
            v.checkForm();

            if(!state.form.valid) {
                v.addInvalidMessage("Cannot Publish with invalid or missing input.");
            }
        }

        content.schedule.checkValidity();
        if(!state.dates.validSchedule) {
            isValid = false;
            v.addInvalidMessage("Invalid schedule.");
        }

        if(!state.form.valid || !isValid) {
            return false;
        }

        return true;
    };
}

