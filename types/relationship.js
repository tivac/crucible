"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    map    = require("lodash.map"),
    fuzzy  = require("fuzzysearch"),
    slug   = require("unique-slug"),
    
    db = require("../lib/firebase"),
    
    types = require("./types.css"),
    css   = require("./relationship.css");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            sources;
        
        ctrl.id = slug(options.details.name);

        ctrl.sources = function() {
            if(sources) {
                return;
            }

            db.child("content").orderByChild("_schema").equalTo(options.details.schema).once("value", function(snap) {
                sources = map(snap.val(), function(details, id) {
                    return {
                        id    : id,
                        name  : details._name,
                        lower : details._name.toLowerCase()
                    };
                });
            });
        };

        ctrl.oninput = function(value) {
            ctrl.sources();

            if(!sources) {
                return;
            }

            if(!value) {
                ctrl.suggestions = null;

                return;
            }

            value = value.toLowerCase();

            ctrl.suggestions = sources.filter(function(source) {
                return fuzzy(value, source.lower);
            });
        };

        // Set up a two-way relationship between these
        ctrl.add = function(id) {
            options.ref.child(id).set(true);
            db.child("content/" + id + "/_relationships/" + options.root.key()).set(true);
        };

        // BREAK THE RELATIONSHIP
        ctrl.remove = function(id) {
            options.ref.child(id).remove();
            db.child("content/" + id + "/_relationships/" + options.root.key()).remove();
        };
    },
    
    view : function(ctrl, options) {
        var details = options.details
            name    = details.name;
            
        if(details.required) {
            name += "*";
        }
        
        return m("div", { class : options.class },
            m("ul",
                options.data && Object.keys(options.data).map(function(key) {
                    return m("li", key,
                        m("button", {
                            onclick : ctrl.remove.bind(ctrl, key)
                        }, "✘")
                    );
                })
            ),
            m("label", {
                for   : ctrl.id,
                class : types[details.required ? "required" : "label"]
            }, name),
            m("input", assign({
                    id      : ctrl.id,
                    class   : types.input,
                    oninput : m.withAttr("value", ctrl.oninput)
                },
                details.attrs || {}
            )),
            m("ul",
                ctrl.suggestions && ctrl.suggestions.map(function(suggestion) {
                    return m("li", {
                        "data-id" : suggestion.id,
                        onclick   : options.ref && m.withAttr("data-id", ctrl.add)
                    }, suggestion.name)
                })
            )
        );
    }
};
