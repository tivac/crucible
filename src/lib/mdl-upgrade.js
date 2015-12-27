/* global componentHandler */
"use strict";

module.exports = function (el, init) {
    if(init) {
        return;
    }
    
    componentHandler.upgradeElement(el);
};
