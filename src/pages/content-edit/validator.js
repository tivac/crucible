import m from "mithril";
import debounce from "lodash.debounce";

import css from "./validator.css";

function attachInputHandlers(vnode) {
    var form = vnode.state.form;

    form.querySelectorAll("input, textarea, select").forEach(function(formInput) {
        formInput.addEventListener("invalid", function(evt) {
            evt.target.classList.add(css.highlightInvalid);
            vnode.state.registerInvalidField(evt.target.name);
        });

        formInput.addEventListener("focus", function(evt) {
            evt.target.classList.remove(css.highlightInvalid);
            vnode.state.onFormFocus(evt); // focus doesn't bubble, so we listen to all the inputs for this.
        });
    });
}

export function controller(options) {
    var ctrl = this;

    ctrl.form = null;

    ctrl.init = function() {
        ctrl.form = options.form;

        if(!ctrl.form) {
            return console.warn("Validator did not receive a reference to the form.");
        }

        ctrl.currOpacity = 0;
        ctrl.fadeTime = 0.5;
        ctrl.fadeDelay = 1.5;
        ctrl.invalidInputs = [];

        attachInputHandlers(ctrl);
    };

    ctrl.registerInvalidField = function(name) {
        if(ctrl.invalidInputs.indexOf(name) > -1) {
            return; // Already registered.
        }

        ctrl.show();
        ctrl.invalidInputs.push(name);
        ctrl.debounceFade();
    };

    ctrl.debounceFade = debounce(function() {
        ctrl.hide();
    }, 100);

    ctrl.onFormFocus = function() {
        if(ctrl.invalidInputs.length) {
            ctrl.debounceFade();
        }
    };

    ctrl.resetInvalidFields = function() {
        ctrl.invalidInputs = [];
        ctrl.hide();
    };

    ctrl.show = function() {
        var oldOpacity = ctrl.currOpacity;

        ctrl.currOpacity = 1;
        if(oldOpacity !== ctrl.currOpacity) {
            // Only do once; avoid superfluous redraws.
            m.redraw();
        }
    };

    ctrl.hide = function() {
        // CSS transition does the rest.
        ctrl.currOpacity = 0;
        m.redraw();
    };

    ctrl.init();
}

export function view(vnode) {
    if(!vnode.state.invalidInputs.length) {
        return m("div", { style : "display:none;" });
    }

    return m("div", {
            class : vnode.state.currOpacity === 0 ? css.delayedHide : css.visible,

            oncreate : function(vnode) {
                vnode.dom.addEventListener("transitionend", function() {
                    vnode.state.resetInvalidFields();
                    m.redraw();
                });
            }
        },
        "Missing required fields.",
        m("ul",
            vnode.state.invalidInputs.map(function(name) {
                return m("li", name);
            })
        ),
        m("button", {
                class   : css.closeInvalidMessage,
                onclick : vnode.state.resetInvalidFields
            },
            "x" // todo
        )
    );
}
