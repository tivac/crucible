import m from "mithril";

import css from "./invalid-msg.css";

// A mosly-dumb controller is required here so we can retain some state 
// information about this transitioning element. Mithril makes it pretty
// tricky to do this sort of a transition over time or after a delay.

export function controller(options) {
    var ctrl = this,
        content = options.content;

    ctrl.invalidMessages = [];
    ctrl.wasInvalid = false;
    ctrl.transitioning = false;

    ctrl.updateState = function(state) {
        // We need to retain our own copy of the invalid fields,
        // because they get cleared out from state very quickly.
        ctrl.invalidMessages = state.form.invalidMessages;
        ctrl.wasInvalid = state.ui.invalid;
        ctrl.transitioning = true;
    };

    ctrl.reset = function() {
        content.validity.reset();

        ctrl.invalidMessages = [];
        ctrl.wasInvalid = false;
        ctrl.transitioning = false;
    };
}

export function view(ctrl, options) {
    var content = options.content,
        state = content.get(),
        invalid = state.ui.invalid;

    console.log("state.form.invalidMessages", state.form.invalidMessages);

    if(!invalid && !ctrl.transitioning) {
        return m("div", { style : "display:none;" });
    }

    if(invalid && !ctrl.wasInvalid) {
        ctrl.updateState(state);
    }

    return m("div", {
            class : invalid ? css.visible : css.delayedHide,

            config : function(el, isInit) {
                if(isInit) {
                    return;
                }

                ctrl.transitioning = true;

                el.addEventListener("transitionend", function(evt) {
                    ctrl.reset();
                    m.redraw();
                });
            }
        },
        "The form cannot be saved.",
        m("ul",
            ctrl.invalidMessages.map(function(name) {
                return m("li", name);
            })
        ),
        m("button", {
                class : css.closeInvalidMessage,

                onclick : function() {
                    ctrl.reset();
                    content.resetInvalid();
                }
            },
            "x" // todo, figure out how to use a unicode x here
        )
    );
}
