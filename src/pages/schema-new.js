import m from "mithril";
import sluggo from "sluggo";

import db from "../lib/firebase";
import prefix from "../lib/prefix";

import * as layout from "./layout/index";
import css from "./schema-new.css";

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
        content : m("div", { class : css.content },
            m("h1", { class : css.header }, "New Schema"),
            m("form", { onsubmit : ctrl.onsubmit },
                m("label", "Name: "),
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
