import m from "mithril";

import * as layout from "./layout/index";

import css from "./layout/layout.css";

export function view() {
    return m.component(layout, {
        title   : "Home",
        content : m("div", { class : css.content },
            m("div", { class : css.body },
                m("ul",
                    m("li",
                        m("a", { href : "/schemas", config : m.route }, "Schemas")
                    ),
                    m("li",
                        m("a", { href : "/content", config : m.route }, "Content")
                    )
                )
            )
        )
    });
}
