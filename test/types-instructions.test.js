/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    instructions = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("./src/types/instructions.js", instructions));
    
    describe("/types/instructions", function() {
        before(function() {
            this.controller = instructions.exports.controller || function() { };
            this.view       = instructions.exports.view;
        });
        
        it("should exist", function() {
            assert(typeof this.controller === "function");
            assert(typeof this.view === "function");
        });
            
        // Basic type tests
        require("./lib/type-basics")();
        
        it("should render head", function() {
            var out = query(this.view(null, {
                    field : {
                        head : "head"
                    }
                }));
            
            assert(out.has("div > p[class$=head]"));
            assert(out.contains("head"));
        });
        
        it("should render body", function() {
            var out = query(this.view(null, {
                    field : {
                        body : "body"
                    }
                }));
            
            assert(out.contains("body"));
        });
    });
});
