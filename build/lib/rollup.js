"use strict";

// Firebase included as a banner to avoid all sorts of weird bundling issues :mad:
var firebase = require("fs").readFileSync("./node_modules/firebase/firebase.js", "utf8");

module.exports = function(options) {
    var opts = options || {};
    
    return {
        entry : "src/index.js",
        dest  : "gen/index.js",
        
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
            require("rollup-plugin-json")(),

            require("rollup-plugin-node-builtins")(),
            
            require("rollup-plugin-node-resolve")({
                // jsnext  : true,
                browser : true,
                skip    : [ "firebase" ]
            }),
            
            require("rollup-plugin-commonjs")(),
            
            require("modular-css/rollup")({
                css : "gen/index.css",
                
                // Optional tiny exported selectors
                namer : opts.compress ? require("modular-css-namer")() : undefined,
                
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
