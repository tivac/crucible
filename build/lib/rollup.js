"use strict";

module.exports = function(options) {
    var opts = options || {};
    
    return {
        plugins : [
            require("rollup-plugin-node-builtins")(),
            
            require("rollup-plugin-node-resolve")({
                browser : true
            }),
            
            require("rollup-plugin-commonjs")({
                include : "node_modules/**",
                exclude : "node_modules/rollup-plugin-node-globals/**"
            }),
            
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
            })
        ]
    };
};
