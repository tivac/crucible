"use strict";

module.exports = function(options) {
    console.log(options.path.join("-"));
    
    return options.path.length ? options.path.join("-") : options.details.key;
};
