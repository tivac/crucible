/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    
    shell      = require("shelljs"),
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    bytes      = require("pretty-bytes"),
    uglify     = require("uglify-js"),
    slug       = require("unique-slug"),

    builder  = browserify("src/index.js", { debug : false }),
    
    start;

// Set up gen dir
shell.mkdir("-p", "./gen");

// Generate things

// Plugins
builder.plugin("modular-css/browserify", {
    css : "./gen/index.css",
    
    // Tiny exported selectors
    namer : function(file, selector) {
        var hash = slug(file + selector);
        
        return hash.search(/^[a-z]/i) === 0 ? hash : "a" + hash;
    },
    
    // lifecycle hooks
    before : [
        require("postcss-nested")
    ],
    after : [
        require("postcss-import")()
    ],
    done : [
        require("cssnano")()
    ]
});

builder.plugin("bundle-collapser/plugin");

// Transforms
builder.transform("detabbify", { global : true });

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
