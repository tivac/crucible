"use strict";

var slug = require("sluggo");

module.exports = function(options) {
    var id = options.details.name;
    
    if(options.ref) {
        id = options.ref.toString().replace(options.ref.root(), "");
    }
            
    return slug(id);
};
