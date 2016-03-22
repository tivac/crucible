"use strict";

var url = require("url"),
    
    config = global.anthracite || {};

config.root = url.parse(document.baseURI).pathname;
config.icons = document.baseURI + "gen/icons.svg";

module.exports = config;
