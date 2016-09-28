import m from "mithril";
import debounce from "lodash.debounce";

import css from "../invalid-msg.css";

export default function Validator(content) {
    var v = this,
        state = content.get();

    v.state = state;

    v.attachInputHandlers = function(state) {
        var form = state.form.el;

        form.querySelectorAll("input, textarea, select").forEach(function(formInput) {
            formInput.addEventListener("invalid", function(evt) {
                v.state.form.invalid = true;
                
                evt.target.classList.add(css.highlightInvalid);
                v.registerInvalidField(evt.target.name);
            });

            formInput.addEventListener("focus", function(evt) {
                evt.target.classList.remove(css.highlightInvalid);
                v.onFormFocus(evt); // focus doesn't bubble, so we listen to all the inputs for this.
            });
        });
    };

    v.registerInvalidField = function(name) {
        content.addInvalid(name);
        v.show();
        v.debounceFade();
    };

    v.onFormFocus = function() {
        if(state.form.invalidFields.length) {
            v.debounceFade();
        }
    };

    v.debounceFade = debounce(function() {
        v.hide();
    }, 100);

    v.show = function() {
        var old = state.ui.invalid;

        state.ui.invalid = true;
        if(old !== state.ui.invalid) {
            m.redraw(); // Only do once; avoid superfluous redraws.
        }
    };

    v.hide = function() {
        // CSS transition does the rest.
        state.ui.invalid = false;
        m.redraw();
    };

    v.validSchedule = function() {
        var pub = state.dates.published_at,
            unpub = state.dates.unpublished_at;

        return (!pub && !unpub) ||
            (pub && !unpub) ||
            (unpub && !pub) ||
            (pub && unpub && pub < unpub);
    };
}

