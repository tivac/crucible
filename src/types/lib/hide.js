"use strict";

var m   = require("mithril"),
    get = require("lodash.get"),
    
    field = [ "details", "show", "field" ],
    
    dom = m("div", "");

module.exports = function(options) {
    var dep = get(options, field),
        src, tgt, hide;
    
    // No conditional visibility config or missing target field
    if(!dep) {
        return;
    }
    
    src = options.details.show.value;
    tgt = get(options, [ "state", dep ]);
    
    // RegExp matched
    if(get(options, [ "details", "show", "type" ]) === "regexp") {
        src = new RegExp(src, "i");
        
        if(src.test(tgt)) {
            return;
        }
    }
    
    // Values match-ish
    if(src == tgt) {
        return;
    }
    
    // Otherwise this field should hide
    return dom;
};
