"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    map    = require("lodash.map"),
    fuzzy  = require("fuzzysearch"),
    
    Awesomeplete = require("awesomplete"),

    db = require("../lib/firebase"),
    id = require("../lib/id"),

    types = require("./types.css"),
    css   = require("./relationship.css");

module.exports = {
    controller : function(options) {
        var ctrl    = this,
            schema  = options.details.schema,
            content = db.child("content/" + schema);

        ctrl.id     = id(options);
        ctrl.lookup = null;

        ctrl.autocomplete = function(el, init) {
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
            
            content.on("value", function(snap) {
                var names  = [];
                
                ctrl.lookup = {};
                
                snap.forEach(function(details) {
                    var val = details.val();
                    
                    names.push(val.name);
                    
                    ctrl.lookup[val.name] = details.key();
                });
                
                ctrl.autocomplete.list = names;
                ctrl.autocomplete.evaluate();
            });
        };
        
        // Set up a two-way relationship between these
        ctrl.add = function(e) {
            var id = ctrl.lookup[e.target.value];
            
            if(!id) {
                console.error(e.target.value);
                
                return;
            }
            
            e.target.value = "";
            
            options.ref.child(id).set(true);

            content.child(id + "/relationships/" + options.root.key()).set(true);
        };

        // BREAK THE RELATIONSHIP
        ctrl.remove = function(id) {
            options.ref.child(id).remove();

            content.child(id + "/relationships/" + options.root.key()).remove();
        };
    },

    view : function(ctrl, options) {
        var details = options.details,
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
            m("input", assign(details.attrs || {}, {
                id     : ctrl.id,
                class  : types.input,
                config : ctrl.autocomplete,
                onkeydown : function(e) {
                    if(e.keyCode !== 9 || ctrl.autocomplete.opened === false) {
                        return;
                    }
                    
                    ctrl.autocomplete.select();
                }
            }))
        );
    }
};
