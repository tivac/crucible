/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    
    out = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("./src/types/lib/id.js", out));

    describe("/types/lib/id", () => {
        var id;
        
        before(() => {
            id = out.exports;
        });
        
        it("should concatenate the path if it exists", () => {
            var out = id({
                    path : [ "fooga", "booga" ]
                });
            
            assert(out === "fooga-booga");
        });
        
        it("should use the key if the path is empty", () => {
            var out = id({
                    path    : [],
                    details : {
                        key : "fooga"
                    }
                });
            
            assert(out === "fooga");
        });
    });
});
