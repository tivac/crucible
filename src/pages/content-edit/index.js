import m from "mithril";

import sluggo from "sluggo";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";
import get from "lodash.get";
import merge from "lodash.merge";
import assign from "lodash.assign";
import capitalize from "lodash.capitalize";

import db from "../../lib/firebase.js";
import update from "../../lib/update.js";
import watch from "../../lib/watch.js";
import prefix from "../../lib/prefix.js";
import name from "./name.js";

import * as children from "../../types/children.js";
import * as layout from "../layout/index.js";
import * as head from "./head.js";

import css from "./content-edit.css";

export function controller() {
    var ctrl = this,

        id     = vnode.attrs.id,
        schema = db.child("schemas/" + vnode.attrs.schema),
        ref    = db.child("content/" + vnode.attrs.schema + "/" + id);

    ctrl.id     = id;
    ctrl.ref    = ref;
    ctrl.schema = null;
    ctrl.form   = null;
    ctrl.data   = {};
    ctrl.hidden = [];

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
            return m.route.set(prefix("/content/" + vnode.attrs.schema));
        }

        ctrl.data = assign(data, {
            fields : merge(data.fields, ctrl.data.fields)
        });

        // Create slug value if it doesnt exist already
        if(!ctrl.data.slug) {
            ctrl.data.slug = sluggo(ctrl.data.name);
        }

        return m.redraw();
    });

    watch(ref);


    ctrl.registerHidden = function(key, isHidden) {
        var index = ctrl.hidden.indexOf(key);

        if(isHidden) {
            ctrl.hidden.push(key);
        } else if(index > -1) {
            ctrl.hidden.splice(index, 1);
        }
    };

    // Event Handlers
    ctrl.titleChange = function(title) {
        update(ctrl.data, [ "name" ], title);
        update(ctrl.data, [ "slug" ], sluggo(title));
    };
}

export function view(vnode) {
    var status  = "draft",
        publishTs = get(vnode.state, "data.published_at"),
        unpublishTs = get(vnode.state, "data.unpublished_at"),
        title;

    if(isFuture(publishTs)) {
        status = "scheduled";
    } else if(isPast(publishTs)) {
        status = "published";
    } else if(isPast(unpublishTs)) {
        status = "unpublished";
    }

    if(!vnode.state.schema) {
        return m(layout);
    }

    title = [ get(vnode.state.data, "name"), vnode.state.schema.name ]
        .filter(Boolean)
        .map(capitalize)
        .join(" | ");

    if(!vnode.state.id) {
        m.route.set("/listing/" + vnode.state.schema.key);
    }

    return m(layout, {
        title   : title,
        content : [
            m("div", { class : css.content },
                m(head, vnode.state),
                m("div", { class : css.body },
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
                                oncreate : function(vnode) {
                                    vnode.state.form = vnode.dom;

                                    // force a redraw so publishing component can get
                                    // new args w/ actual validity

                                    m.redraw();
                                }
                            },
                            m("h1", {
                                    // Attrs
                                    class  : css.title,
                                    oncreate : function(vnode) {
                                        var range, selection;

                                        // Select the text contents
                                        range = document.createRange();
                                        range.selectNodeContents(vnode.dom);
                                        selection = window.getSelection();
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                    },

                                    contenteditable : true,

                                    // Events
                                    oninput : m.withAttr("innerText", vnode.state.titleChange)
                                },
                                name(vnode.state.schema, vnode.state.data)
                            ),
                            m(children, {
                                class  : css.children,
                                data   : vnode.state.data.fields || {},
                                fields : vnode.state.schema.fields,
                                path   : [ "fields" ],
                                root   : vnode.state.ref,
                                state  : vnode.state.data.fields,
                                update : update.bind(null, vnode.state.data)
                            })
                        )
                    )
                )
            )
        ]
    });
}
