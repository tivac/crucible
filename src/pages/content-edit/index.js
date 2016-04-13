"use strict";

var m          = require("mithril"),
    sluggo     = require("sluggo"),
    get        = require("lodash.get"),
    merge      = require("lodash.merge"),
    assign     = require("lodash.assign"),
    capitalize = require("lodash.capitalize"),

    children = require("../../types/children"),
    db       = require("../../lib/firebase"),
    update   = require("../../lib/update"),
    watch    = require("../../lib/watch"),
    prefix   = require("../../lib/prefix"),

    layout = require("../layout"),
    nav    = require("./nav"),
    head   = require("./head"),

    css = require("./index.css");

module.exports = {
    controller : function() {
        var ctrl = this,
    
            id     = m.route.param("id"),
            schema = m.route.param("schema"),
            ref    = db.child("content/" + m.route.param("schema") + "/" + id);

        ctrl.id     = id;
        ctrl.ref    = ref;
        ctrl.data   = null;
        ctrl.schema = null;
        ctrl.form   = null;
        ctrl.data   = {};
        ctrl.slugs  = [];

        db.child("schemas/" + schema).once("value", function(snap) {
            ctrl.schema = snap.val();
            ctrl.schema.key = snap.key();
            
            m.redraw();
        });
        
        db.child("content/" + schema).on("value", function(snap) {
            var slugs = [];

            snap.forEach(function(record) {
                var val = record.val();
                
                slugs.push(val.slug || sluggo(val.title));
            });
            
            ctrl.slugs = slugs;
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
            var slug  = sluggo(title),
                found = ctrl.slugs.some(function(existing) {
                    return slug === existing;
                });
            
            if(found) {
                ctrl.slug.setCustomValidity("Slug already used");
            }
            
            update(ctrl.data, [ "name" ], title);
            update(ctrl.data, [ "slug" ], sluggo(title));
        };
        
        ctrl.slugChange = function(slug) {
            console.log("slugchange %s", slug);
        };
    },

    view : function(ctrl) {
        var title;

        if(!ctrl.schema) {
            return m(layout);
        }

        title = [ get(ctrl.data, "name"), ctrl.schema.name ].filter(Boolean).map(capitalize).join(" | ");

        if(!ctrl.id) {
            return m(layout, {
                title   : title,
                content : [
                    m(nav, ctrl.schema),
                    m("div", { class : css.empty },
                        m("p", "Select an entry from the list")
                    )
                ]
            });
        }

        return m(layout, {
            title   : title,
            content : [
                m(nav, ctrl.schema),
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
                    m(head, ctrl),
                    m("div", { class : css.body },
                        m("h1", {
                                // Attrs
                                class           : css.title,
                                contenteditable : true,

                                // Events
                                oninput : m.withAttr("innerText", ctrl.titleChange)
                            },
                            ctrl.data.name || ""
                        ),
                        ctrl.schema.slug ? [
                            m("input", {
                                // Attrs
                                class : css.slug,
                                value : ctrl.data.slug || "???",

                                // Events
                                oninput : m.withAttr("value", ctrl.slugChange),
                                config  : function(el, init) {
                                    if(init) {
                                        return;
                                    }
                                    
                                    ctrl.slug = el;
                                }
                            }),
                            ctrl.slug && !ctrl.slug.validity.valid ?
                                m("p", ctrl.slug.validationMessage) : null
                        ] : null,
                        m(children, {
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
            ]
        });
    }
};
