/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),
    uglify     = require("uglify-js"),
    // compile    = require("google-closure-compiler-js"),

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

builder.bundle(function(err, out) {
    var result,
        code;
    
    if(err) {
        console.error("Error in:", duration(Date.now() - start));
        console.error(err.toString());
        
        return;
    }
    
    result = uglify.minify(out.toString(), { fromString : true });
    code   = result.code;
    
    console.log("Bundled & compressed in:", duration(Date.now() - start));
    console.log("Output size:", bytes(code.length));
    
    fs.writeFileSync("./gen/index.js", code);
    
    return;
});
