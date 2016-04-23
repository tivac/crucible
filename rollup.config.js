"use strict";

var files = {};

module.exports = {
    plugins : [
        require("modular-css/rollup")({
            css : "./gen/index.css",
            
            // Tiny exported selectors
            namer : function namer(file, selector) {
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
                require("cssnano")()
            ]
        })
    ]
};
