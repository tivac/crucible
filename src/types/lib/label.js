"use strict";
 
var m = require("mithril"),
    
    css = require("./types.css");

 
module.exports = function(ctrl, options) {
    var details = options.details,
        name    = details.name,
        style   = css.label;
    
    if(details.required) {
        name += "*";
        style = css.required;
    }
     
    return m("label", {
        for   : ctrl.id,
        class : style
    }, name);
};
