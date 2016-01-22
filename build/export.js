"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),

    builder  = browserify("src/index.js"),
    
    start;

builder.plugin("modular-css", {
    css   : "gen/index.css",
    after : [
        require("postcss-import"),
        require("cssnano")()
    ]
});

start = Date.now();

builder.bundle(function(err, out) {
    console.log("Finished in:", duration(Date.now() - start));
    console.log("Output size:", bytes(out.length));
    
    if(err) {
        return console.error(err.toString());
    }
    
    fs.writeFileSync("gen/index.js", out);
});
