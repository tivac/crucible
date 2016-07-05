/* eslint no-console:0 */
"use strict";

var rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),

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
    console.log("Bundled & compressed in:", duration(Date.now() - start));
})
.catch(console.error.bind(console));
