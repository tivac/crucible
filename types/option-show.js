"use strict";

var m = require("mithril");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("option", details.attrs || {}, details.name);
    }
};
