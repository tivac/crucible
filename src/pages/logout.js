import m from "mithril";

import { app } from "../lib/firebase.js";
import { prefix } from "../lib/routes.js";

import * as layout from "./layout/index.js";

export function controller() {
    app.auth().signOut().then(function() {
        m.route(prefix("/"));
    });
}

export function view() {
    return m.component(layout, {
        title   : "Logging out...",
        content : m("div", { class : layout.css.content },
            m("h1", "Logging you out...")
        )
    });
}
