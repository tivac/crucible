/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),
    uglify     = require("uglify-js"),

    builder  = browserify("src/index.js"),
    
    start;


builder.plugin("modular-css", {
    css   : "gen/index.css",
    after : [
        require("postcss-import"),
        require("cssnano")()
    ]
});

builder.plugin("bundle-collapser/plugin");

builder.transform("detabbify");

start = Date.now();

builder.bundle(function(err, out) {
    var result;
    
    if(err) {
        console.log("Error in:", duration(Date.now() - start));
        return console.error(err.toString());
    }
    
    result = uglify.minify(out.toString(), { fromString : true });
    
    console.log("Bundled & compressed in:", duration(Date.now() - start));
    console.log("Output size:", bytes(result.code.length));
    
    fs.writeFileSync("gen/index.js", result.code);
    
    return console.log("Done");
});
