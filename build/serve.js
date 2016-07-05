/* eslint no-console:0 */
"use strict";

var fs   = require("fs"),
    path = require("path"),
    url  = require("url"),
    
    duration = require("humanize-duration"),
    jsesc    = require("jsesc"),
    rollup   = require("rollup"),
    watch    = require("rollup-watch"),
    
    files  = require("./lib/files"),
    config = require("./lib/rollup"),
    
    server = require("connect")(),
    
    ecstatic = require("ecstatic")(process.cwd(), {
        cache       : 0,
        handleError : false
    }),

    watcher, bundling, done;

// Set up gen dir
files.dir();

// Watch for changes to static files
files.watch();

// Log HTTP requests
server.use(require("morgan")("dev"));

// Delay responding to generated file requests until it's done
server.use("/gen/index.js", function(req, res, next) {
    /* eslint consistent-return: 0 */
    if(!bundling) {
        return next();
    }
    
    console.log("Waiting for bundle to finish...");
    
    done = next;
});

// Set up basic ecstatic serving of files
server.use(ecstatic);

// SPA support
server.use(function(req, res, next) {
    var parts = url.parse(req.url);
    
    if(path.extname(parts.pathname)) {
        res.code = 404;

        return next("Unknown file: " + req.url);
    }

    req.url = "/";

    return ecstatic(req, res, next);
});

server.listen(9966);

console.log("Server listening at http://localhost:9966");

watcher = watch(rollup, config());

watcher.on("event", function(details) {
    if(details.code === "BUILD_START") {
        bundling = true;

        console.log("Bundling...");

        return;
    }
    
    bundling = false;

    if(details.code === "BUILD_END") {
        console.log("Bundle written to ./gen/index.js in", duration(details.duration));

        return done && done();
    }

    if(details.code === "ERROR") {
        console.error(details.error.stack);

        fs.writeFileSync(
            "gen/index.js",
            "document.body.innerHTML = \"<pre style='color: red;'>" + jsesc(details.error.stack) + "</pre>\";"
        );

        return done && done();
    }
});
