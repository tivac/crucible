"use strict";

var required = /\*$/,
    types;

function slugger(name) {
    return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}

function process(obj) {
    var out = [];

    Object.keys(obj).forEach(function(name) {
        var field = obj[name];

        if(typeof field !== "object") {
            field = {
                type : field
            };
        }

        // Handle required fields
        if(name.search(required) > -1) {
            name = name.slice(0, -1);

            field.required = true;
        }

        field.name = name;
        field.slug = slugger(name);
        
        if(field.show) {
            field.show.field = slugger(field.show.field);
            
            // Regular expressions need to be saved out specially
            if(field.show.value instanceof RegExp) {
                field.show.type  = "regexp";
                field.show.value = field.show.value.source;
            }
        }

        if(field.type === "tabs") {
            field.children = Object.keys(field.tabs).map(function(tabName) {
                var tab = field.tabs[tabName];

                return {
                    name     : tabName,
                    slug     : slugger(tabName),
                    children : process(tab)
                };
            });

            delete field.tabs;
        }

        if(field.type === "repeating" || field.type === "fieldset") {
            field.children = process(field.fields);

            delete field.fields;
        }

        if(field.type === "select") {
            field.children = Object.keys(field.options).map(function(name) {
                var details = field.options[name];

                return {
                    name     : name,
                    value    : details.value || details,
                    selected : details.selected || false
                };
            });

            delete field.options;
        }

        if(field.type === "radio") {
            field.children = Object.keys(field.options).map(function(name) {
                var details = field.options[name];

                return {
                    name    : name,
                    value   : details.value || details,
                    checked : details.checked || false
                };
            });

            delete field.options;
        }

        if(field.type === "split") {
            field.children = Object.keys(field.sections).map(function(name) {
                return {
                    name     : name,
                    slug     : slugger(name),
                    children : process(field.sections[name])
                };
            });

            delete field.sections;
        }

        out.push(field);
    });

    return out;
}

// This worker takes the nice, human-friendly config format and turns it into
// ugly arrays of objects for firebase
self.onmessage = function(e) {
    var config;

    try {
        // This is super-gross but in a worker should be (mostly) safe
        eval("config = " + e.data);
    } catch(e) {
        return;
    }

    self.postMessage(process(config));
};
