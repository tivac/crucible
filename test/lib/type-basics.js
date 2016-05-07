var assert = require("better-assert"),
    query  = require("mithril-query");
    
module.exports = function(options) {
    var opts = options || {
            path    : [],
            details : {
                key : "name"
            }
        };
    
    it("should render", function() {
        var ctrl = new this.controller(opts),
            out  = query(this.view(ctrl, Object.assign({}, {
                field : {}
            }, opts)));
        
        assert(out.has("div"));
    });
    
    it("should render hidden", function() {
        var ctrl = new this.controller(opts),
            out  = query(this.view(ctrl, Object.assign({}, {
                state : {},
                field : {
                    show : {
                        field : "fooga"
                    }
                }
            }, opts)));
        
        console.log(Object.assign({}, {
                state : {},
                field : {
                    show : {
                        field : "fooga"
                    }
                }
            }, opts));
        
        out.log("*");
        
        assert(out.has(".hidden"));
    });
    
    it("should respect options.class", function() {
        var ctrl = new this.controller(opts),
            out  = query(this.view(ctrl, Object.assign({}, {
                field : {},
                class : "fooga"
            }, opts)));
        
        assert(out.has(".fooga"));
    });
};
