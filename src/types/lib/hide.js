"use strict";

var m   = require("mithril"),
    get = require("lodash.get"),
    
    field = [ "details", "show", "field" ],
    
    dom = m("div", "");

module.exports = function(options) {
    /* eslint: eqeqeq:0 */
    var dep = get(options, field),
        src, tgt;
    
    // No conditional visibility config or missing target field
    if(!dep) {
        return false;
    }
    
    src = options.details.show.value;
    tgt = get(options, [ "state", dep ]);
    
    // RegExp matched
    if(get(options, [ "details", "show", "type" ]) === "regexp") {
        src = new RegExp(src, "i");
        
        if(src.test(tgt)) {
            return false;
        }
    }
    
    // Values match-ish
    if(src == tgt) {
        return false;
    }
    
    // Otherwise this field should hide
    return dom;
};
