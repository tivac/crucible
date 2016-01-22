/* global crucible */
"use strict";

var m = require("mithril"),
    
    db     = require("../lib/firebase"),
    
    layout = require("./layout"),
    css    = require("./login.css");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.onsubmit = function(e) {
            var form = e.target.elements;
            
            e.preventDefault();
            
            db.authWithPassword({
                email : form.email.value,
                password : form.password.value
            }, function(error) {
                if(error) {
                    ctrl.error = error.message;
                    
                    return m.redraw();
                }
                
                document.location = "/";
            });
        };
        
        if(crucible.auth && crucible.auth !== "password") {
            db.authWithOAuthRedirect(crucible.auth);
        }
    },
    
    view : function(ctrl) {
        return m.component(layout, {
            title   : "Login",
            content : m("div", { class : layout.css.content },
                m("form", { class : css.form, onsubmit : ctrl.onsubmit },
                    m("p",
                        m("label", { class : css.label }, "Email"),
                        m("input", { name : "email", type : "email" })
                    ),
                    m("p",
                        m("label", { class : css.label }, "Password"),
                        m("input", { name : "password", type : "password" })
                    ),
                    m("button", { class : css.button, type : "submit" }, "Login")
                ),
                
                m("p", { class : css.error }, ctrl.error ? "ERROR: " + ctrl.error : null)
            )
        });
    }
};
