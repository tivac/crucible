/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    
    shell      = require("shelljs"),
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),
    uglify     = require("uglify-js"),

    builder  = browserify("src/index.js", { debug : false }),
    
    files = {},
    
    start;

// Set up gen dir
shell.mkdir("-p", "./gen");

// Copy static files
shell.cp("./src/icons.svg", "./gen/icons.svg");

// Plugins
builder.plugin("bundle-collapser/plugin");

// Transforms
builder.transform("detabbify", { global : true });
builder.transform("rollupify", { config : "./rollup.config.js" });

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
    // code = out.toString();
    
    console.log("Bundled & compressed in:", duration(Date.now() - start));
    console.log("Output size:", bytes(code.length));
    
    fs.writeFileSync("./gen/index.js", code);
    
    return;
});
