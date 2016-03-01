/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    
    shell      = require("shelljs"),
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),
    uglify     = require("uglify-js"),

    builder  = browserify("src/index.js"),
    
    start;

// Set up export dir
shell.mkdir("-p", "./export/gen");

// Copy over static things
shell.cp("./index.html", "./export/index.html");
shell.cp("./src/icons.svg", "./export/gen/icons.svg");

// Generate things

// Plugins
builder.plugin("modular-css/browserify", {
    css   : "./export/gen/index.css",
    after : [
        require("postcss-import"),
        require("cssnano")()
    ]
});

builder.plugin("bundle-collapser/plugin");

// Transforms
builder.transform("detabbify", { global : true });
builder.transform("workerify");

start = Date.now();

builder.bundle(function(err, out) {
    var result;
    
    if(err) {
        console.error("Error in:", duration(Date.now() - start));
        console.error(err.toString());
        
        return;
    }
    
    result = uglify.minify(out.toString(), { fromString : true });
    
    console.log("Bundled & compressed in:", duration(Date.now() - start));
    console.log("Output size:", bytes(result.code.length));
    
    fs.writeFileSync("./export/gen/index.js", result.code);
    
    return;
});
