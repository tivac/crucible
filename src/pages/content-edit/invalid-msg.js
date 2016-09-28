import m from "mithril";

import css from "./invalid-msg.css";

// A mosly-dumb controller is required here so we
// can retain some state information about this
// transitioning element.
export function controller(options) {
    var ctrl = this;

    ctrl.prevInvalid = false;
    ctrl.transitioning = false;
    ctrl.tempInvalidFields = [];

    ctrl.updateState = function(state) {
        ctrl.transitioning = true;
        ctrl.prevInvalid = state.ui.invalid;
        ctrl.tempInvalidFields = state.form.invalidFields;
    };

    ctrl.reset = function() {
        ctrl.prevInvalid = false;
        ctrl.transitioning = false;
        ctrl.tempInvalidFields = [];
    };
}

export function view(ctrl, options) {
    var content = options.content,
        state = content.get(),
        invalidFields = ctrl.tempInvalidFields;

    if(state.ui.invalid && !ctrl.prevInvalid) {
        ctrl.updateState(state);
    }

    if(!ctrl.transitioning && state.form.valid) {
        return m("div", { style : "display:none;" });
    }

    return m("div", {
            class : !state.ui.invalid ? css.delayedHide : css.visible,

            config : function(el, isInit) {
                if(isInit) {
                    return;
                }

                el.addEventListener("transitionend", function(evt) {
                    content.resetInvalid();
                    ctrl.reset();
                    m.redraw();
                });
            }
        },
        "Missing required fields.",
        m("ul",
            invalidFields.map(function(name) {
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
