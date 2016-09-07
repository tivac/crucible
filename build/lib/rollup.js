"use strict";

var path = require("path"),

    dest  = path.resolve("./gen/index.js"),
    entry = path.resolve("./src/index.js"),

    // Firebase included as a banner to avoid all sorts of weird bundling issues :mad:
    firebase = require("fs").readFileSync("./node_modules/firebase/lib/firebase-web.js", "utf8");

module.exports = function(options) {
    var opts = options || {};
    
    return {
        entry : entry,
        dest  : dest,
        
        format    : "iife",
        sourceMap : true,

        banner : firebase,

        external : [
            "firebase"
        ],

        globals : {
            firebase : "firebase"
        },

        plugins : [
            require("rollup-plugin-node-builtins")(),
            
            require("rollup-plugin-node-resolve")({
                browser : true,
                ignoreGlobal : true
            }),
            
            require("rollup-plugin-commonjs")(),

            require("modular-css/rollup")({
                css : "./gen/index.css",
                
                // Optional tiny exported selectors
                namer : opts.compress ? require("modular-css-namer")() : undefined,
                
                // Output sourcemap if not compressing
                map : !opts.compress,
                
                // lifecycle hooks
                before : [
                    require("postcss-nested")
                ],
                
                after : [
                    require("postcss-import")()
                ],
                
                // Optionally compress output
                done : opts.compress ? [ require("cssnano")() ] : [ ]
            }),

            opts.compress ?
                require("rollup-plugin-strip")({
                    sourceMap : false
                }) :
                {},

            opts.compress ?
                require("rollup-plugin-babel")({
                    exclude : "node_modules/**",
                    plugins : [
                        require("mithril-objectify")
                    ]
                }) :
                {},
            
            opts.compress ? require("rollup-plugin-uglify")() : {}
        ]
    };
};

module.exports.entry = entry;
module.exports.dest  = dest;
