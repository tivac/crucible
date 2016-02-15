"use strict";

var db = require("./firebase");

module.exports = function() {
    var auth = db.getAuth();
    
    return auth && ((auth.expires * 1000) > Date.now());
};
