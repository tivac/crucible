"use strict";

var m = require("mithril"),
    
    db   = require("../../lib/firebase");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            auth = db.getAuth();
        
        if(!auth && !options.unauth) {
            return m.route("/login");
        }
        
        ctrl.user = auth ? auth[auth.provider] : false;
    },
    
    view : function(ctrl, options) {
        return m("div",
            m("p",
                ctrl.user ?
                    [
                        m("img", { src : ctrl.user.profileImageURL, width : "25", height: "25" }),
                        m("span", ctrl.user.email),
                        " | ",
                        m("a", { href : "/logout" }, "Logout"),
                        " | ",
                        m("a", { href : "/content" }, "Content"),
                        " | ",
                        m("a", { href : "/schemas" }, "Schemas"),
                    ] :
                    m("a", { href : "/login" }, "Login")
            )
        );
    }
};