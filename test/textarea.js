/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    textarea = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("./src/types/textarea.js", textarea));
    
    describe("/types/textarea", function() {
        var Controller, view;
        
        before(() => {
            Controller = textarea.exports.controller;
            view = textarea.exports.view;
        });
        
        it("should exist", () => {
            assert(typeof Controller === "function");
            assert(typeof view === "function");
        });
            
        it("should render", () => {
            var ctrl = new Controller({
                    path    : [],
                    details : {
                        key : "textarea"
                    }
                }),
                
                out = query(view(ctrl, {
                    field : {}
                }));
            
            assert(out.has("div"));
        });
        
        it("should render hidden", () => {
            var ctrl = new Controller({
                    path    : [],
                    details : {
                        key : "textarea"
                    }
                }),
                
                out = query(view(ctrl, {
                    state : {},
                    field : {
                        show : {
                            field : "fooga"
                        }
                    }
                }));
            
            assert(out.has(".hidden"));
        });
        
        it("should respect options.class", () => {
            var ctrl = new Controller({
                    path    : [],
                    details : {
                        key : "textarea"
                    }
                }),
                
                out = query(view(ctrl, {
                    field : {},
                    class : "fooga"
                }));
            
            assert(out.has(".fooga"));
        });
    });
});
