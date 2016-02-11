"use strict";

var m      = require("mithril"),
    moment = require("moment");

module.exports = function(data) {
    var now    = Date.now(),
        status = "Draft";
        
    if(data.published > now) {
        status = "Scheduled for " + moment(data.published).format("lll");
    }
    
    if(data.published < now) {
        status = "Published on " + moment(data.published).format("lll");
    }
    
    return m("p",
        status
    );
};
