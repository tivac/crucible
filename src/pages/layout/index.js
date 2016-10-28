import m from "mithril";

import config, { title } from "../../config";
import db from "../../lib/firebase";
import auth from "../../lib/valid-auth";
import prefix from "../../lib/prefix";

import header from "./header.css";
import layout from "./layout.css";
import progress from "./progress.css";

// exporting so others can use it more easily
export { layout as css };

export function controller() {
    var ctrl = this;

    ctrl.schemas = null;
    ctrl.auth = auth();

    ctrl.add = function() {
        m.route(prefix("/content/new"));
    };

    db.child("schemas").on("value", function(snap) {
        ctrl.schemas = [];

        snap.forEach(function(schema) {
            var val = schema.val();

            val.key = schema.key();

            ctrl.schemas.push(val);
        });

        m.redraw();
    });
}

export function view(ctrl, options) {
    var current = m.route(),
        locked  = config.locked;

    if(!options) {
        options = false;
    }

    document.title = (options.title || "Loading...") + " | " + title;

    return m("div", { class : layout.container },
        options && options.inProgress ?
            m("div", { class : progress.bar }) :
            null,

        m("div", { class : header.header },

            m("a", {
                    class  : header.headerHd,
                    href   : prefix("/"),
                    config : m.route
                },
                m("h1", { class : header.title }, title)
            ),

            m("div", { class : header.headerBd },
                ctrl.auth ? [
                    m("div", { class : header.schemas },
                        (ctrl.schemas || []).map(function(schema) {
                            var searchUrl = prefix("/content/" + schema.key),
                                targetUrl = prefix("/listing/" + schema.key),
                                active;

                            active = current.indexOf(searchUrl) === 0 || current.indexOf(targetUrl) === 0;

                            return m("a", {
                                    class  : header[active ? "active" : "schema"],
                                    href   : targetUrl,
                                    config : m.route
                                },
                                schema.name
                            );
                        })
                    ),

                    m("button", {
                        // Attrs
                        class    : header.add,
                        disabled : locked || null,

                        // Events
                        onclick : ctrl.add
                    }, "New Schema"),

                    m("a", {
                        class  : header.logout,
                        href   : prefix("/logout"),
                        config : m.route
                    }, "Logout")
                ] :
                null
            )
        ),
        options.content ? options.content : null
    );
}
