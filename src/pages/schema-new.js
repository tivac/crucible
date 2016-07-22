import m from "mithril";
import sluggo from "sluggo";

import db from "../lib/firebase.js";
import { prefix } from "../lib/routes.js";

import * as layout from "./layout/index.js";

export function controller() {
    var ctrl  = this;

    ctrl.name = "";
    ctrl.slug = false;

    ctrl.oninput = function(name) {
        ctrl.name = name;
        ctrl.slug = sluggo(name);
    };

    ctrl.onsubmit = function(e) {
        e.preventDefault();

        db.child("schemas/" + ctrl.slug).set({
            name    : ctrl.name,
            created : db.TIMESTAMP,
            updated : db.TIMESTAMP
        });

        m.route(prefix("/content/" + ctrl.slug + "/edit"));
    };
}

export function view(ctrl) {
    return m.component(layout, {
        title   : "Create a Schema",
        content : m("div", { class : layout.css.content },
            m("form", { onsubmit : ctrl.onsubmit },
                m("input[name=name]", {
                    oninput : m.withAttr("value", ctrl.oninput),
                    value   : ctrl.name
                }),
                m("p",
                    "Slug: " + (ctrl.slug || "???")
                ),
                m("input[type=submit]", { value : "Add" })
            )
        )
    });
}
