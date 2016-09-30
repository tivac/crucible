import m from "mithril";
import debounce from "lodash.debounce";

import css from "../invalid-msg.css";

export default function Validity(content) {
    var v = this;
        content = content;

    v.handlersAttached = false;

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

    v.checkValidity = function() {
        v.attachInputHandlers();

        return content.get().form.el.checkValidity();
    };

    v.registerInvalidField = function(name) {
        content.addInvalidField(name);
        v.show();
        v.debounceFade();
    };
    v.addInvalidField = function(name) {
        var state = content.get();

        if(state.form.invalidFields.indexOf(name) > -1) {
            return;
        }
        state.form.invalidFields.push(name);
    };

    v.resetInvalid = function() {
        var state = content.get();

        state.form.valid = true;
        state.form.invalidFields = [];
    };


    v.onFormFocus = function() {
        if(!content.get().form.valid) {
            v.debounceFade();
        }
    };


    v.show = function() {
        var wasInvalid = content.get().ui.invalid;

        content.toggleInvalid(true);
        if(!wasInvalid) {
            m.redraw(); // Only do once; avoid superfluous redraws.
        }
    };

    v.hide = function() {            
        // CSS transition does the rest.
        content.toggleInvalid(false);
        m.redraw();
    };

    v.debounceFade = debounce(function() {
        v.hide();
    }, 100);

    v.checkSchedule = function() {
        var state = content.get(),
            pub = state.dates.published_at,
            unpub = state.dates.unpublished_at;

        return (!pub && !unpub) ||
            (pub && !unpub) ||
            (unpub && !pub) ||
            (pub && unpub && pub < unpub);
    };
}

