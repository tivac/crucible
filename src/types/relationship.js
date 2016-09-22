import m from "mithril";
import assign from "lodash.assign";
import Awesomeplete from "awesomplete";

import db from "../lib/firebase";

import id from "./lib/id";
import label from "./lib/label";
import types from "./lib/types.css";

import css from "./relationship.css";

export default {
    oninit : function(vnode) {
        var ctrl    = this,
            schema  = vnode.attrs.field.schema,
            content = db.child("content/" + schema);

        ctrl.id      = id(vnode.attrs);
        ctrl.lookup  = null;
        ctrl.handle  = null;
        ctrl.related = null;
        ctrl.names   = [];
        
        ctrl.options = vnode.attrs;

        ctrl.config = function(el, init) {
            if(init) {
                return;
            }

            ctrl.autocomplete = new Awesomeplete(el, {
                minChars  : 3,
                maxItems  : 10,
                autoFirst : true
            });

            ctrl.input = el;

            el.addEventListener("awesomplete-selectcomplete", ctrl.add);

            ctrl.autocomplete.list = ctrl.names;

            ctrl.load();
        };

        ctrl.load = function() {
            if(ctrl.handle) {
                return;
            }

            ctrl.handle = content.on("value", function(snap) {
                ctrl.lookup  = {};
                ctrl.related = snap.val();
                ctrl.names   = [];

                snap.forEach(function(details) {
                    var val = details.val();

                    ctrl.names.push(val.name);

                    ctrl.lookup[val.name] = details.key();
                });

                if(ctrl.autocomplete) {
                    ctrl.autocomplete.list = ctrl.names;
                    ctrl.autocomplete.evaluate();
                }

                m.redraw();
            });
        };

        // Set up a two-way relationship between these
        ctrl.add = function(e) {
            var key = ctrl.lookup[e.target.value];

            if(!key) {
                console.error(e.target.value);

                return;
            }

            e.target.value = "";

            ctrl.options.update(ctrl.options.path.concat(key), true);

            if(ctrl.options.root) {
                content.child(key + "/relationships/" + ctrl.options.root.key()).set(true);
            }
        };

        // BREAK THE RELATIONSHIP
        // TODO: Maybe broken?
        ctrl.remove = function(tgt, e) {
            var key = ctrl.lookup[e.target.value];

            e.preventDefault();
            
            vnode.attrs.update(vnode.attrs.path.concat(tgt), false);
            
            if(vnode.attrs.root) {
                content.child(key + "/relationships/" + vnode.attrs.root.key()).remove();
            }
        };

        if(vnode.attrs.data) {
            ctrl.load();
        }
    },

    view : function(vnode) {
        var field  = vnode.attrs.field;
        
        vnode.state.options = vnode.attrs;

        return m("div", { class : vnode.attrs.class },
            label(vnode.state, vnode.attrs),
            m("input", assign(field.attrs || {}, {
                // Attrs
                id     : vnode.state.id,
                class  : types.input,
                config : vnode.state.config,

                // Events
                onkeydown : function(e) {
                    if(e.keyCode !== 9 || vnode.state.autocomplete.opened === false) {
                        return;
                    }

                    vnode.state.autocomplete.select();
                }
            })),
            m("div", { class : css.relationships },
                vnode.attrs.data && Object.keys(vnode.attrs.data).map(function(key) {
                    return m("div", { class : css.relationship },
                        m("p", { class : css.name },
                            vnode.state.related ? vnode.state.related[key].name : "Loading..."
                        ),
                        m("div", { class : css.actions },
                            m("button", {
                                class   : css.remove,
                                onclick : vnode.state.remove.bind(vnode.state, key)
                            }, "Remove")
                        )
                    );
                })
            )
        );
    }
};
