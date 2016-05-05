"use strict";

var fs = require("fs"),
    
    files = require("./lib/files"),
    b     = require("./lib/browserify")({ debug : true });

// Set up gen dir
require("shelljs").mkdir("-p", "./gen");

files.copy();

b.bundle(function(err, out) {
    if(err) {
        console.error(err.toString());
        
        return;
    }
    
    fs.writeFileSync("./gen/index.js", out.toString());
});
