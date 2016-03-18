"use strict";

var m   = require("mithril"),
    get = require("lodash.get"),
    
    field = [ "show", "field" ],
    
    dom = m("div", "");

module.exports = function(options) {
    /* eslint: eqeqeq:0 */
    var dep = get(options.field, field),
        src, tgt;
    
    // No conditional visibility config or missing target field
    if(!dep) {
        return false;
    }
    
    src = options.field.show.value;
    tgt = get(options.state, dep);
    
    // No target value, so have to hide it
    if(typeof tgt === "undefined" || tgt === null) {
        return dom;
    }
    
    // RegExp matched
    if(options.field.show.type === "regexp") {
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
