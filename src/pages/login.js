/* global crucible */
"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase"),
    
    nav = require("./nav");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.onsubmit = function(e) {
            var form = e.target.elements;
            
            e.preventDefault();
            
            db.authWithPassword({
                email : form.email.value,
                password : form.password.value
            }, function(error, auth) {
                if(error) {
                    ctrl.error = error.message;
                    
                    return m.redraw();
                }
                
                m.route("/");
            });
        };
        
        if(crucible.auth && crucible.auth !== "password") {
            db.authWithOAuthRedirect(crucible.auth);
        }
    },
    
    view : function(ctrl) {
        return [
            m(nav, { unauth : true }),
            m("h1", "CRUCIBLE LOGIN"),
            
            m("form", { onsubmit : ctrl.onsubmit },
                m("p",
                    m("label", "Email"),
                    m("br"),
                    m("input", { name : "email", type : "email" })
                ),
                m("p",
                    m("label", "Password"),
                    m("br"),
                    m("input", { name : "password", type : "password" })
                ),
                m("button", { type : "submit" }, "Login")
            ),
            
            ctrl.error ?
                m("p", "ERROR: " + ctrl.error) :
                null
        ];
    }
};
