import m from "mithril";

import css from "./invalid-msg.css";

// export function controller(options) {
//     var ctrl = this;

//     ctrl.form = null;

//     ctrl.init = function() {
//         ctrl.form = options.form.el;

//         if(!ctrl.form) {
//             return console.warn("Validator did not receive a reference to the form.");
//         }

//         ctrl.currOpacity = 0;
//         ctrl.fadeTime = 0.5;
//         ctrl.fadeDelay = 1.5;
//         ctrl.invalidInputs = [];

//         attachInputHandlers(ctrl);
//     };

//     ctrl.registerInvalidField = function(name) {
//         if(ctrl.invalidInputs.indexOf(name) > -1) {
//             return; // Already registered.
//         }

//         ctrl.show();
//         ctrl.invalidInputs.push(name);
//         ctrl.debounceFade();
//     };

//     ctrl.debounceFade = debounce(function() {
//         ctrl.hide();
//     }, 100);

//     ctrl.onFormFocus = function() {
//         if(ctrl.invalidInputs.length) {
//             ctrl.debounceFade();
//         }
//     };

//     ctrl.resetInvalidFields = function() {
//         ctrl.invalidInputs = [];
//         ctrl.hide();
//     };

//     ctrl.show = function() {
//         var oldOpacity = ctrl.currOpacity;

//         ctrl.currOpacity = 1;
//         if(oldOpacity !== ctrl.currOpacity) {
//             // Only do once; avoid superfluous redraws.
//             m.redraw();
//         }
//     };

//     ctrl.hide = function() {
//         // CSS transition does the rest.
//         ctrl.currOpacity = 0;
//         m.redraw();
//     };

//     ctrl.init();
// }

export function view(ctrl, options) {
    var content = options.content,
        state = content.get();

    // TEMP to find bad old code
    var ctrl = null;

    if(state.form.valid) {
        return m("div", { style : "display:none;" });
    }

    console.log("state.ui.invalid", state.ui.invalid);

    return m("div", {
            class : !state.ui.invalid ? css.delayedHide : css.visible,

            config : function(el, isInit) {
                if(isInit) {
                    return;
                }

                el.addEventListener("transitionend", function() {
                    content.resetInvalid();
                });
            }
        },
        "Missing required fields.",
        m("ul",
            state.form.invalidFields.map(function(name) {
                return m("li", name);
            })
        ),
        m("button", {
                class : css.closeInvalidMessage,

                onclick : content.resetInvalid()
            },
            "x" // todo, figure out how to use a unicode x here
        )
    );
}
