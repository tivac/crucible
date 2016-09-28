/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    instructions = {};

describe("Crucible", () => {
    before(() => require("./lib/rollup")("./src/types/instructions.js", instructions));
    
    describe("/types/instructions", function() {
        var view;
        
        before(() => {
            view = instructions.exports.view;
        });
        
        it("should exist", () => {
            assert(typeof view === "function");
        });
            
        it("should render", () => {
            var out = query(view(null, {
                    field : {}
                }));
            
            assert(out.has("div"));
        });
 
        it("should respect options.class", () => {
            var out = query(view(null, {
                    field : {},
                    class : "fooga"
                }));
            
            assert(out.has(".fooga"));
        });
        
        it("should render head", () => {
            var out = query(view(null, {
                    field : {
                        head : "head"
                    }
                }));
            
            assert(out.has("div > p[class$=head]"));
            assert(out.contains("head"));
        });
        
        it("should render body", () => {
            var out = query(view(null, {
                    field : {
                        body : "body"
                    }
                }));
            
            assert(out.contains("body"));
        });
    });
});
