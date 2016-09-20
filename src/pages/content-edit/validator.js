import m from "mithril";
import toArray from "lodash.toarray";

import debounce from "lodash.debounce";

import css from "./validator.css";

function allInputs(form) {
    var result = [],
        inputs;

    [ "input", "select", "textarea" ].forEach(function(kind) {
        inputs = toArray(form.querySelectorAll(kind));
        result = result.concat(inputs);
    });

    return result;
}

function attachInputHandlers(ctrl) {
    var form = ctrl.form;

    allInputs(form).forEach(function(inp) {
        inp.addEventListener("invalid", function(evt) {
            ctrl.registerInvalidField(evt.target.name);

            evt.target.classList.add(css.highlightInvalid);
        });

        // focus doesn't bubble
        inp.addEventListener("focus", function(evt) {
            ctrl.onFormFocus(evt);
            
            evt.target.classList.remove(css.highlightInvalid);
        });
    });
}

export function controller(options) {
    var ctrl = this,
        form = options.form;

    ctrl.form = form;

    ctrl.init = function() {
        ctrl.form = options.form;
        ctrl.currOpacity = 0;
        ctrl.fadeTime = 0.5;
        ctrl.fadeDelay = 1.5;
        ctrl.invalidInputs = [];

        if(!ctrl.form) {
            return;
        }

        attachInputHandlers(ctrl, ctrl.form);
    };

    ctrl.registerInvalidField = function(name) {
        var currOpacity = ctrl.currOpacity;

        if(ctrl.invalidInputs.indexOf(name) > -1) {
            return;
        }

        ctrl.currOpacity = 1;
        ctrl.invalidInputs.push(name);
        ctrl.debounceFade();

        if(currOpacity !== ctrl.currOpacity) {
            m.redraw();
        }
    };

    ctrl.debounceFade = debounce(function() {
        ctrl.currOpacity = 0;
        m.redraw();
    }, 100);

    ctrl.onFormFocus = function() {
        if(ctrl.invalidInputs.length) {
            ctrl.debounceFade();
        }
    };

    ctrl.resetInvalidFields = function() {
        ctrl.invalidInputs = [];
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

    style = `opacity:${ctrl.currOpacity};`;
    style += ctrl.currOpacity === 0 ? `transition: opacity ${ctrl.fadeTime}s ${ctrl.fadeDelay}s linear` : "";

    return m("div#invalidMessage",
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
