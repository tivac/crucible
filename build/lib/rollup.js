"use strict";

var path = require("path"),

    dest  = path.resolve("./gen/index.js"),
    entry = path.resolve("./src/index.js"),

    // Firebase included as a banner to avoid all sorts of weird bundling issues :mad:
    firebase = require("fs").readFileSync("./build/external/firebase-2.4.2.js", "utf8");

module.exports = function(options) {
    var opts = options || {};
    
    return {
        entry : entry,
        dest  : dest,
        
        format    : "iife",
        sourceMap : true,

        context : "window",

        banner : firebase,

        external : [
            "firebase"
        ],

        globals : {
            firebase : "Firebase"
        },

        plugins : [
            require("rollup-plugin-node-resolve")({
                browser : true,
                ignoreGlobal : true,
                preferBuiltins: false
            }),
            
            require("rollup-plugin-commonjs")(),

            require("rollup-plugin-string")({
                include : "**/*.svg"
            }),

            require("modular-css-rollup")({
                css : "./gen/index.css",
                map : !opts.compress,

                // Optional tiny exported selectors
                namer : opts.compress ? require("modular-css-namer")() : undefined,
                
                // lifecycle hooks
                before : [
                    require("stylelint")(),
                    require("postcss-nested")
                ],
                
                after : [
                    require("postcss-import")()
                ],
                
                // Optionally compress output
                done : opts.compress ?
                    [ require("cssnano")() ] :
                    [ ]
            }),
            
            require("rollup-plugin-file-as-blob")({
                include: "**/parse-schema.js"
            }),

            opts.compress ?
                require("rollup-plugin-strip")() :
                {},
            
            opts.compress ?
                require("rollup-plugin-babel")({
                    exclude : "node_modules/**",
                    plugins : [
                        require("mithril-objectify")
                    ]
                }) :
                {},
            
            opts.compress ?
                require("rollup-plugin-uglify")() :
                {},
            
            require("rollup-plugin-filesize")()
        ]
    };
};

module.exports.entry = entry;
module.exports.dest  = dest;
