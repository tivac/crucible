"use strict";

var fs = require("fs"),
    
    rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),

    config = require("./lib/rollup")(),
    
    start;

require("./lib/files").dir();
require("./lib/files").copy();

start = Date.now();

rollup(config).then(function(bundle) {
    return bundle.write(config);
})
.then(function() {
    console.log("Bundle written to ./gen/index.js in %s", duration(Date.now() - start));
    console.log("Bundle size: %s", size(fs.lstatSync(config.dest).size));
})
.catch(function(error) {
    console.error(error.stack);
});
