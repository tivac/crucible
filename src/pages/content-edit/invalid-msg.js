import m from "mithril";

import css from "./invalid-msg.css";

// A mosly-dumb controller is required here so we
// can retain some state information about this
// transitioning element.
export function controller(options) {
    var ctrl = this;

    ctrl.invalidFields = [];
    ctrl.wasInvalid = false;
    ctrl.transitioning = false;

    ctrl.updateState = function(state) {
        // We need to retain our own copy of the invalid fields,
        // because they get cleared out from state very quickly.
        ctrl.invalidFields = state.form.invalidFields;
        ctrl.wasInvalid = state.ui.invalid;
        ctrl.transitioning = true;
    };

    ctrl.reset = function() {
        ctrl.invalidFields = [];
        ctrl.wasInvalid = false;
        ctrl.transitioning = false;
    };
}

export function view(ctrl, options) {
    var content = options.content,
        state = content.get(),
        invalid = state.ui.invalid;

    console.log("invalid, ctrl.transitioning", invalid, ctrl.transitioning);

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
                    content.resetInvalid();
                    ctrl.reset();
                    m.redraw();
                });
            }
        },
        "Missing required fields.",
        m("ul",
            ctrl.invalidFields.map(function(name) {
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
