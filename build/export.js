/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    
    shell      = require("shelljs"),
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),
    uglify     = require("uglify-js"),

    files = require("./files"),

    builder  = browserify("src/index.js", { debug : false }),
    
    start;

// So modular-css as part of rollup knows to compress things
global.compress = true;

// Set up gen dir
shell.mkdir("-p", "./gen");

// Copy static files
files.copy();

// Rollupify goes first
builder.transform("rollupify", { config : require("./_rollup") });

builder.transform("mithril-objectify/browserify");

// Plugins
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
