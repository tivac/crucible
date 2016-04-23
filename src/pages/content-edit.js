var m          = require("mithril"),
    sluggo     = require("sluggo"),
    get        = require("lodash.get"),
    merge      = require("lodash.merge"),
    assign     = require("lodash.assign"),
    capitalize = require("lodash.capitalize");

import db from "../lib/firebase";
import update from "../lib/update";
import watch from "../lib/watch";
import prefix from "../lib/prefix";

import * as children from "../types/children";
import * as layout from "./layout/index";
import * as nav from "./content-edit/nav";
import * as head from "./content-edit/head";

import css from "./content-edit.css";

export function controller() {
    var ctrl = this,

        id     = m.route.param("id"),
        schema = db.child("schemas/" + m.route.param("schema")),
        ref    = db.child("content/" + m.route.param("schema") + "/" + id);

    ctrl.id     = id;
    ctrl.ref    = ref;
    ctrl.data   = null;
    ctrl.schema = null;
    ctrl.form   = null;
    ctrl.data   = {};

    schema.on("value", function(snap) {
        ctrl.schema = snap.val();
        ctrl.schema.key = snap.key();

        m.redraw();
    });

    // No sense doing any work if we don't have an id to operate on
    if(!id) {
        return;
    }

    // On updates from firebase we need to merge in fields carefully
    ref.on("value", function(snap) {
        var data = snap.val();

        // Don't try to grab non-existent data
        if(!snap.exists()) {
            return m.route(prefix("/content/" + m.route.param("schema")));
        }

        ctrl.data = assign(data, {
            fields : merge(data.fields, ctrl.data.fields)
        });
        
        // Create slug value if it doesnt exist already
        if(!ctrl.data.slug) {
            ctrl.data.slug = sluggo(ctrl.data.name);
        }

        m.redraw();
    });

    watch(ref);
    
    // Event Handlers
    ctrl.titleChange = function(title) {
        update(ctrl.data, [ "name" ], title);
        update(ctrl.data, [ "slug" ], sluggo(title));
    };
}

export function view(ctrl) {
    var title;

    if(!ctrl.schema) {
        return m.component(layout);
    }

    title = [ get(ctrl.data, "name"), ctrl.schema.name ].filter(Boolean).map(capitalize).join(" | ");

    if(!ctrl.id) {
        return m.component(layout, {
            title   : title,
            content : [
                m.component(nav),
                m("div", { class : css.empty },
                    m("p", "Select an entry from the list")
                )
            ]
        });
    }

    return m.component(layout, {
        title   : title,
        content : [
            m.component(nav),
            m("div", { class : css.content },
                m.component(head, ctrl),
                m("div", { class : css.body },
                    m("form", {
                            class  : css.form,
                            config : function(el, init) {
                                if(init) {
                                    return;
                                }

                                ctrl.form = el;

                                // force a redraw so publishing component can get
                                // new args w/ actual validity
                                m.redraw();
                            }
                        },
                        m("h2", { class : css.schema },
                            "/" + ctrl.schema.name + "/",
                            ctrl.schema.slug ?
                                (ctrl.data.slug || "???") + "/" : null
                        ),
                        m("h1", {
                                // Attrs
                                class           : css.title,
                                contenteditable : true,

                                // Events
                                oninput : m.withAttr("innerText", ctrl.titleChange)
                            },
                            ctrl.data.name || ""
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
            )
        ]
    });
}
