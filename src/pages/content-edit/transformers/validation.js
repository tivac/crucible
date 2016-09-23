import m from "mithril";
import debounce from "lodash.debounce";

import css from "./invalid-msg.css";

function attachInputHandlers(ctrl) {
    var form = ctrl.form;

    form.querySelectorAll("input, textarea, select").forEach(function(formInput) {
        formInput.addEventListener("invalid", function(evt) {
            evt.target.classList.add(css.highlightInvalid);
            ctrl.registerInvalidField(evt.target.name);
        });

        formInput.addEventListener("focus", function(evt) {
            evt.target.classList.remove(css.highlightInvalid);
            ctrl.onFormFocus(evt); // focus doesn't bubble, so we listen to all the inputs for this.
        });
    });
}

export function validity(state) {
    var v = this,
        form;

    v.init = function() {
        form = state.form.el;

        if(!form) {
            return console.warn("Validator did not receive a reference to the form.");
        }

        attachInputHandlers(form);
    };

    v.registerInvalidField = function(name) {
        if(v.invalidInputs.indexOf(name) > -1) {
            return; // Already registered.
        }

        v.show();
        v.invalidInputs.push(name);
        v.debounceFade();
    };

    v.debounceFade = debounce(function() {
        v.hide();
    }, 100);

    v.onFormFocus = function() {
        if(v.invalidInputs.length) {
            v.debounceFade();
        }
    };

    v.show = function() {
        var oldOpacity = v.currOpacity;

        v.currOpacity = 1;
        if(oldOpacity !== v.currOpacity) {
            // Only do once; avoid superfluous redraws.
            m.redraw();
        }
    };

    v.hide = function() {
        // CSS transition does the rest.
        v.currOpacity = 0;
        m.redraw();
    };

    v.init();    
};
