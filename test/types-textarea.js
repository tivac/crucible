"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    textarea = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("./src/types/textarea.js", textarea));
    
    describe("/types/textarea", function() {
        
        before(function() {
            this.controller = textarea.exports.controller || function() { };
            this.view       = textarea.exports.view;
        });
        
        it("should exist", function() {
            assert(typeof this.controller === "function");
            assert(typeof this.view === "function");
        });
            
        // Basic type tests
        require("./lib/type-basics")();
    });
});
