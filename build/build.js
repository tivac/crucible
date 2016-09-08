"use strict";

var fs = require("fs"),
    
    rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),
    
    argv = require("minimist")(process.argv.slice(2)),

    files  = require("./lib/files"),
    config = require("./lib/rollup")(argv),
    
    start = Date.now();

files.copy();

rollup(config)
    .then((bundle) => bundle.write(config))
    .then(() => {
        console.log("Bundle written to ./gen/index.js in %s", duration(Date.now() - start));
        console.log("Bundle size: %s", size(fs.lstatSync(config.dest).size));
    })
    .catch((error) => console.error(error.stack));
