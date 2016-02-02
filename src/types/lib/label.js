"use strict";
 
var m = require("mithril"),
    
    css = require("./types.css");

 
module.exports = function(ctrl, options) {
    var field = options.field,
        name  = field.name,
        style = css.label;
    
    if(field.required) {
        name += "*";
        style = css.required;
    }
     
    return m("label", {
        for   : ctrl.id,
        class : style
    }, name);
};
