/* eslint no-console:0 */
"use strict";

var fs = require("fs"),

    rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),

    files   = require("./lib/files"),
    config  = require("./lib/rollup")({ compress : true }),
    
    start;

// Set up gen dir
files.dir();

// Copy static files
files.copy();

start = Date.now();

rollup(config).then(function(bundle) {
    return bundle.write(config);
})
.then(function() {
    console.log("Bundled & compressed in: %s", duration(Date.now() - start));
    console.log("Bundle size: %s", size(fs.lstatSync(config.dest).size));
})
.catch(console.error.bind(console));
