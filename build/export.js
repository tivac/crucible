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
shell.mkdir("-p", "./export/src");
shell.mkdir("-p", "./export/gen");

// Copy over static-y things
shell.cp("./index.html", "./export/index.html");
shell.cp("./src/icons.svg", "./export/src/icons.svg");

// Generated things
builder.plugin("modular-css", {
    css   : "./export/gen/index.css",
    after : [
        require("postcss-import"),
        require("cssnano")()
    ]
});

builder.plugin("bundle-collapser/plugin");

builder.transform("detabbify", { global : true });

start = Date.now();

builder.bundle(function(err, out) {
    var result;
    
    if(err) {
        console.log("Error in:", duration(Date.now() - start));
        return console.error(err.toString());
    }
    
    // result = uglify.minify(out.toString(), { fromString : true });
    result = {
        code : out.toString()
    };
    
    console.log("Bundled & compressed in:", duration(Date.now() - start));
    console.log("Output size:", bytes(result.code.length));
    
    fs.writeFileSync("./export/gen/index.js", result.code);
    
    return console.log("Done");
});
