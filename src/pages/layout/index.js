import m from "mithril";

import config, { title } from "../../config";
import db from "../../lib/firebase";
import auth from "../../lib/valid-auth";
import { prefix } from "../../lib/routes";

import header from "./header.css";
import layout from "./layout.css";
import progress from "./progress.css";

// exporting so others can use it more easily
export { layout as css };
    
export function controller() {
    var ctrl   = this;

    ctrl.schemas = null;
    ctrl.auth = auth();

    ctrl.add = function() {
        m.route(prefix("/content/new"));
    };

    db.child("schemas").on("value", function(snap) {
        ctrl.schemas = [];

        snap.forEach(function(schema) {
            var val = schema.val();

            val.key = schema.key;

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
        options.content ? null : m("div", { class : progress.bar }),

        m("div", { class : header.container },

            m("div", { class : header.top },
                m("a", {
                        class  : header.heading,
                        href   : prefix("/"),
                        config : m.route
                    },
                    m("h1", { class : header.title }, title)
                )
            ),

            m("div", { class : header.body },
                ctrl.auth ? [
                    m("div", { class : header.schemas },
                        (ctrl.schemas || []).map(function(schema) {
                            var url = prefix("/content/" + schema.key);

                            return m("a", {
                                    class  : header[current.indexOf(url) === 0 ? "active" : "schema"],
                                    href   : url,
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
