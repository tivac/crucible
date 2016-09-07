/* eslint no-console:0 */
"use strict";

var fs = require("fs"),

    rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),

    files   = require("./lib/files"),
    builder = require("./lib/browserify")({ compress : true }),
    
    start;

// Set up gen dir
require("shelljs").mkdir("-p", "./gen");

// Copy static files
files.copy();

// Pre-compile m() calls where possible
builder.transform("mithril-objectify/browserify");

// Flatten bundles out as much as possible
builder.plugin("bundle-collapser/plugin");

start = Date.now();

rollup(config).then(function(bundle) {
    return bundle.write(config);
})
.then(function() {
    console.log("Bundled & compressed in: %s", duration(Date.now() - start));
    console.log("Bundle size: %s", size(fs.lstatSync(config.dest).size));
})
.catch(console.error.bind(console));
