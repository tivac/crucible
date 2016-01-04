"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    browserify = require("browserify"),
    duration   = require("humanize-duration"),
    
    server   = require("connect")(),
    ecstatic = require("ecstatic")(process.cwd(), {
        cache       : 0,
        handleError : false
    }),
    builder  = browserify("src/index.js", {
        debug : true
    }),
    
    bundling, bytes, time, done;

function bundle() {
    bundling = true;
    
    builder.bundle(function(err, out) {
        bundling = false;
        
        if(err) {
            console.error(err.toString());
            
            fs.writeFileSync(
                "gen/index.js",
                "document.body.innerHTML = \"<pre style='color: red;'>" + err.toString().replace(/\\/g, "/") + "</pre>\";"
            );
            
            return done && done();
        }

        console.error(bytes.toString(), "bytes written to gen/index.js in", duration(time));
        
        fs.writeFileSync("gen/index.js", out);
        
        done && done();
    });
}

builder.plugin("watchify");
builder.plugin("modular-css", {
    css : "gen/index.css"
});

// Start up watchify
builder.on("update", bundle);

builder.on("bytes", function(b) {
    bytes = b;
});

builder.on("time", function(t) {
    time = t;
});

bundle();

// Log HTTP requests
server.use(require("morgan")("dev"));

// Delay responding to generated file requests until it's done
server.use("/gen/index.js", function(req, res, next) {
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
    if(path.extname(req.url)) {
        res.code = 404;

        return next("Unknown file: " + req.url);
    }

    req.url = "/";

    ecstatic(req, res, next);
});

server.listen(9966);

console.log("Server listening at http://localhost:9966");
