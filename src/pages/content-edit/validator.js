import m from "mithril";
import toArray from "lodash.toarray";

import debounce from "lodash.debounce";

import css from "./validator.css";

function allInputs(form) {
    var all = [],
        inputs;

    [ "input", "select", "textarea" ].forEach(function(kind) {
        inputs = toArray(form.querySelectorAll(kind));
        all = all.concat(inputs);
    });

    return all;
}

function attachInputHandlers(ctrl) {
    var form = ctrl.form;

    allInputs(form).forEach(function(formInput) {
        formInput.addEventListener("invalid", function(evt) {
            ctrl.registerInvalidField(evt.target.name);

            evt.target.classList.add(css.highlightInvalid);
        });

        // focus doesn't bubble
        formInput.addEventListener("focus", function(evt) {
            ctrl.onFormFocus(evt);

            evt.target.classList.remove(css.highlightInvalid);
        });
    });
}

export function controller(options) {
    var ctrl = this;

    ctrl.form = null;

    ctrl.init = function() {
        ctrl.form = options.form;
        if(!ctrl.form) {
            return;
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
        var currOpacity = ctrl.currOpacity;

        ctrl.currOpacity = 1;

        if(currOpacity !== ctrl.currOpacity) {
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

export function view(ctrl, options) {
    var style = "";

    if(!ctrl.invalidInputs.length) {
        return m("div", { style : "display:none;" });
    }

    // No transition if we're going from 0 -> 1.
    style = `opacity:${ctrl.currOpacity};`;
    style += ctrl.currOpacity === 0 ? `transition: opacity ${ctrl.fadeTime}s ${ctrl.fadeDelay}s linear` : "";

    return m("div",
        {
            class : css.invalidMessage,
            style : style,

            config : function(el) {
                el.addEventListener("transitionend", function() {
                    ctrl.resetInvalidFields();
                    m.redraw();
                });
            }
        },
        "Missing required fields.",
        m("ul",
            ctrl.invalidInputs.map(function(name) {
                return m("li", name);
            })
        ),
        m("button", {
            class   : css.closeInvalidMessage,
            onclick : ctrl.resetInvalidFields
        },
            "x" // todo
        )
    );
}
