"use strict";

var required = /\*$/,
    types;

function slugger(name) {
    return name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function processChildren(children) {
    return Object.keys(children).map(function(label) {
        var details = children[label];
        
        return {
            key      : slugger(label),
            name     : label,
            value    : details.value || details,
            attrs    : details.attrs || {},
            selected : Boolean(details.selected)
        };
    });
}

function processSections(sections) {
    return Object.keys(sections).map(function(label) {
        var section = sections[label];

        return {
            name     : label,
            key      : section.key || slugger(label),
            children : process(section)
        };
    });
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
        
        if(!field.key) {
            field.key = slugger(name);
        }
        
        if(field.show) {
            field.show.field = slugger(field.show.field);
            
            // Regular expressions need to be saved out specially
            if(field.show.value instanceof RegExp) {
                field.show.type  = "regexp";
                field.show.value = field.show.value.source;
            }
        }

        if(field.type === "tabs") {
            field.children = processSections(field.tabs);
            
            delete field.tabs;
        }
        
        if(field.type === "split") {
            field.children = processSections(field.sections);

            delete field.sections;
        }

        if(field.type === "repeating" || field.type === "fieldset") {
            field.children = process(field.fields);

            delete field.fields;
        }

        if(field.type === "select" || field.type === "checkbox" || field.type === "radio") {
            field.children = processChildren(field.options);

            delete field.options;
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
        console.error("Invalid config");
        
        return;
    }

    self.postMessage(process(config));
};
