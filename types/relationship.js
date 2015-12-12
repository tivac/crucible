"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    map    = require("lodash.map"),
    fuzzy  = require("fuzzysearch"),
    
    db = require("../lib/firebase"),
    
    types = require("./types.css"),
    css   = require("./relationship.css");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            sources;
        
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
                ctrl.suggestions = false;

                return;
            }

            value = value.toLowerCase();

            ctrl.suggestions = sources.filter(function(source) {
                return fuzzy(value, source.lower);
            });
        };

        ctrl.onclick = function(id) {
            // Set up a two-way relationship between these
            options.ref.child(id).set(true);
            db.child("content/" + id + "/_relationships/" + options.root.key()).set(true);
        };
    },
    
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div", { class : types[options.index ? "field" : "first"].join(" ") },
            m("ul",
                options.data && Object.keys(options.data).map(function(key) {
                    return m("li", key);
                })
            ),
            m("label", { class : types.label.join(" ") }, details.name,
                m("input", assign({
                        oninput : m.withAttr("value", ctrl.oninput)
                    },
                    details.attrs || {}
                ))
            ),
            m("ul",
                ctrl.suggestions && ctrl.suggestions.map(function(suggestion) {
                    return m("li", {
                        "data-id" : suggestion.id,
                        onclick   : options.ref && m.withAttr("data-id", ctrl.onclick)
                    }, suggestion.name)
                })
            )
        );
    }
};
