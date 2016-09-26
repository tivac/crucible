import m from "mithril";
import debounce from "lodash.debounce";

import css from "../invalid-msg.css";

export default function Validator(state) {
    var v = this;

    v.state = state;

    v.attachInputHandlers = function(state) {
        var form = state.form.el;

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

    v.registerInvalidField = function(name) {
        if(state.form.invalidFields.indexOf(name) > -1) {
            return; // Already registered.
        }
        
        state.form.invalidFields.push(name);
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
        console.log("v.show");
        var old = state.ui.invalid;
        state.ui.invalid = true;

        if(old !== state.ui.invalid) {
            m.redraw(); // Only do once; avoid superfluous redraws.
        }
    };

    v.hide = function() {
        console.log("v.hide");
        // CSS transition does the rest.
        state.ui.invalid = false;
        m.redraw();
    };
};
