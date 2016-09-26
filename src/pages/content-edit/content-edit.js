import m from "mithril";

import capitalize from "lodash.capitalize";
import update from "../../lib/update.js";
import name from "./name.js";
import * as children from "../../types/children.js";

import css from "./content-edit.css";

export function view(ctrl, content) {
    var state = content.get();

    return m("div", { class : css.body },
        m("div", { class : css.contentsContainer },
            m("div", { class : css.itemStatus },
                m("p", { class : css[status] }, [
                    m("span", { class : css.statusLabel },
                        "Status: "
                    ),
                    capitalize(state.meta.status)
                ])
            ),
            m("form", {
                    class  : css.form,
                    config : function(el, isInit) {
                        if(isInit) {
                            return;
                        }

                        content.registerForm(el);

                        // force a redraw so publishing component can get
                        // new args w/ actual validity

                        m.redraw();
                    }
                },
                m("h1", {
                        // Attrs
                        class  : css.title,
                        config : function(el, isInit) {
                            var range, selection;

                            // if(isInit || ctrl.data.name) {
                            if(isInit) {
                                return;
                            }

                            // Select the text contents
                            range = document.createRange();
                            range.selectNodeContents(el);
                            selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                        },

                        contenteditable : true,

                        // Events
                        oninput : m.withAttr("innerText", ctrl.titleChange)
                    },
                    name(state.meta.schema, state.meta)
                ),
                m.component(children, {
                    class  : css.children,
                    data   : state.fields || {},
                    fields : state.schema.fields,
                    path   : [ "fields" ],
                    root   : ctrl.ref,
                    state  : state.fields,
                    update : update.bind(null, ctrl.data)
                })
            )
        )
    );
}
