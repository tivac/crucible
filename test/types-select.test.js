"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    state = require("./lib/state"),
    
    select = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("src/types/select.js", select));
    
    describe("/types/select", function() {
        before(function() {
            this.controller = select.exports.controller || function() { };
            this.view       = select.exports.view;
        });
        
        it("should exist", function() {
            assert(typeof this.controller === "function");
            assert(typeof this.view === "function");
        });
            
        // Basic type tests
        require("./lib/type-basics")({
            field : {
                children : []
            }
        });
        
        it("should render children as <option>s", function() {
            var options = state({
                    field : {
                        children : [ {
                            key   : "option",
                            value : "option"
                        } ]
                    }
                }),
                instance = new this.controller(options),
                out  = query(this.view(instance, options));
            
            assert(out.has("option[value='option']"));
        });
    });
});
