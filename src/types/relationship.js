"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    Awesomeplete = require("awesomplete"),

    db = require("../lib/firebase"),

    id    = require("./lib/id"),
    hide  = require("./lib/hide"),
    types = require("./lib/types.css"),

    css   = require("./relationship.css"),

    requiredRegex = /\*$/;

module.exports = {
    controller : function(options) {
        var ctrl    = this,
            schema  = options.details.schema,
            content = db.child("content/" + schema);

        ctrl.id      = id(options);
        ctrl.lookup  = null;
        ctrl.handle  = null;
        ctrl.related = null;
        ctrl.names   = [];

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

            options.update(options.path.concat(key), true);

            if(options.root) {
                content.child(key + "/relationships/" + options.root.key()).set(true);
            }
        };

        // BREAK THE RELATIONSHIP
        ctrl.remove = function(key) {
            options.update(options.path.concat(key), false);

            if(options.root) {
                content.child(key + "/relationships/" + options.root.key()).remove();
            }
        };

        if(options.data) {
            ctrl.load();
        }
    },

    view : function(ctrl, options) {
        var details = options.details,
            name    = details.name,
            hidden  = hide(options);

        if(hidden) {
            return hidden;
        }

        if(details.required && !requiredRegex.test(name)) {
            name += "*";
        }

        return m("div", { class : options.class },
            m("label", {
                for   : ctrl.id,
                class : types[details.required ? "required" : "label"]
            }, name),
            m("input", assign(details.attrs || {}, {
                // Attrs
                id     : ctrl.id,
                class  : types.input,
                config : ctrl.config,

                // Events
                onkeydown : function(e) {
                    if(e.keyCode !== 9 || ctrl.autocomplete.opened === false) {
                        return;
                    }

                    ctrl.autocomplete.select();
                }
            })),
            m("div", { class : css.relationships },
                options.data && Object.keys(options.data).map(function(key) {
                    return m("div", { class : css.relationship },
                        m("p", { class : css.name },
                            ctrl.related ? ctrl.related[key].name : "Loading..."
                        ),
                        m("div", { class : css.actions },
                            m("button", {
                                class   : css.remove,
                                onclick : ctrl.remove.bind(ctrl, key)
                            }, "Remove")
                        )
                    );
                })
            )
        );
    }
};
