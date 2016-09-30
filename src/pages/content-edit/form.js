import m from "mithril";

import capitalize from "lodash.capitalize";
import name from "./name.js";
import * as children from "../../types/children.js";

import css from "./form.css";

export function view(ctrl_unused, options) {
    var content = options.content,
        state = content.get(),
        status = state.meta.status;

    return m("div", { class : css.body },
        m("div", { class : css.contentsContainer },
            m("div", { class : css.itemStatus },
                m("p", { class : css.status }, [
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
                m("input", {
                        // Attrs
                        class : css[status],
                        type  : "text",
                        value : name(state.schema, state.meta),

                        // Events
                        onchange : m.withAttr("value", content.titleChange.bind(content))
                    }
                ),
                m.component(children, {
                    class  : css.children,
                    data   : state.fields || {},
                    fields : state.schema.fields,
                    path   : [ "fields" ],
                    state  : state.fields,

                    update  : content.setField.bind(content),
                    content : content
                })
            )
        )
    );
}
