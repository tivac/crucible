/* eslint no-console:0 */
"use strict";

var shell    = require("shelljs"),
    duration = require("humanize-duration"),
    rollup   = require("rollup"),

    start = Date.now(),
    files = {};

// Set up gen dir
shell.mkdir("-p", "./gen");

// Copy static files
shell.cp("./src/icons.svg", "./gen/icons.svg");

// Generate things
rollup.rollup({
    entry   : "./src/index.js",
    plugins : [
        require("rollup-plugin-node-builtins")(),
        require("rollup-plugin-node-resolve")({
            browser : true
        }),
        require("rollup-plugin-commonjs")({ sourceMap : true }),
        require("modular-css/rollup")({
            css : "./gen/index.css",
    
            // Tiny exported selectors
            namer : function(file, selector) {
                var hash;
                
                if(!files[file]) {
                    files[file] = {
                        id        : Object.keys(files).length,
                        selectors : {}
                    };
                }
                
                if(!(selector in files[file].selectors)) {
                    files[file].selectors[selector] = Object.keys(files[file].selectors).length;
                }
                
                hash = files[file].id.toString(32) + files[file].selectors[selector].toString(32);
                
                return hash.search(/^[a-z]/i) === 0 ? hash : "a" + hash;
            },
            
            // lifecycle hooks
            before : [
                require("postcss-nested")
            ],
            after : [
                require("postcss-import")()
            ],
            done : [
            
                // require("cssnano")()
            ]
        }),
        require("rollup-plugin-uglify")()
    ]
})
.then(function(bundle) {
    return bundle.write({
        dest : "./gen/index.js"
    });
})
.then(function() {
    console.log("Bundled & compressed in:", duration(Date.now() - start));
})
.catch(function(error) {
    console.error("Error in:", duration(Date.now() - start));
    console.error(error.toString());
});

// Plugins
// builder.plugin("modular-css/browserify", {
//     css : "./gen/index.css",
//     // Tiny exported selectors
//     namer : function(file, selector) {
//         var hash = slug(file + selector);
        
//         return hash.search(/^[a-z]/i) === 0 ? hash : "a" + hash;
//     },
    
//     // lifecycle hooks
//     before : [
//         require("postcss-nested")
//     ],
//     after : [
//         require("postcss-import")()
//     ],
//     done : [
//         require("cssnano")()
//     ]
// });

// builder.plugin("bundle-collapser/plugin");

// // Transforms
// builder.transform("detabbify", { global : true });

// start = Date.now();

// builder.bundle(function(err, out) {
//     var result,
//         code;
    
//     if(err) {
//         console.error("Error in:", duration(Date.now() - start));
//         console.error(err.toString());
        
//         return;
//     }
    
//     result = uglify.minify(out.toString(), { fromString : true });
//     code   = result.code;
    
//     console.log("Bundled & compressed in:", duration(Date.now() - start));
//     console.log("Output size:", bytes(code.length));
    
//     fs.writeFileSync("./gen/index.js", code);
    
//     return;
// });
