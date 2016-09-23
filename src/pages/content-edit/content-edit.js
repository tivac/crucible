import m from "mithril";

import capitalize from "lodash.capitalize";
import update from "../../lib/update.js";
import * as children from "../../types/children.js";

import css from "./content-edit.css";

export function view(ctrl, content) {
    var state = content.get();

    console.log("content :: content", content);

    return m("div", { class : css.body },
        m("div", { class : css.contentsContainer },
            m("div", { class : css.itemStatus },
                m("p", { class : css[status] }, [
                    m("span", { class : css.statusLabel },
                        "Status: "
                    ),
                    capitalize(status)
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
                        config : function(el, init) {
                            var range, selection;

                            if(init || ctrl.data.name) {
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
                    name(ctrl.schema, ctrl.data)
                ),
                m.component(children, {
                    class  : css.children,
                    data   : ctrl.data.fields || {},
                    fields : ctrl.schema.fields,
                    path   : [ "fields" ],
                    root   : ctrl.ref,
                    state  : ctrl.data.fields,
                    update : update.bind(null, ctrl.data)
                })
            )
        )
    );
}
