"use strict";

var path = require("path"),
    
    server   = require("connect")(),
    ecstatic = require("ecstatic")(process.cwd(), {
        cache       : 0,
        handleError : false
    });

server.use(require("morgan")("dev"));
server.use(ecstatic);

// SPA support
server.use(function(req, res, next) {
    if(path.extname(req.url)) {
        res.code = 404;

        return next("Unknown file");
    }

    req.url = "/";

    ecstatic(req, res, next);
});

server.listen(9966);
