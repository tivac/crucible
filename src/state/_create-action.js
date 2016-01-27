"use strict";

module.exports = function createAction(type, fn) {
    return function(value) {
        var args   = [],
            action = {
                type : type
            },
            x;
        
        for(x = 0; x < arguments.length; x++) {
            args.push(arguments[x]);
        }
        
        action.payload = typeof fn === "function" ? fn.apply(null, args) : value;
        
        if(value instanceof Error) {
            action.error = true;
        }
        
        return action;
    };
};
