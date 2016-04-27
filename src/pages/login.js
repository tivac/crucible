import m from "mithril";
import join from "url-join";

import config from "../config";
import db from "../lib/firebase";
import valid from "../lib/valid-auth";
import prefix from "../lib/prefix";

import * as layout from "./layout/index";

import css from "./login.css";

function loginRedirect() {
    window.location = config.loginBaseUrl +
        window.encodeURIComponent(join(window.location.origin, config.root, "/login"));
}

export function controller() {
    var ctrl = this;
    
    if(config.auth === "jwt") {
        if(!m.route.param("auth")) {
            return loginRedirect();
        }

        return db.authWithCustomToken(m.route.param("auth"), function(error) {
            if(error) {
                console.log(error);
                
                return loginRedirect();
            }
            
            return m.route(prefix("/"));
        });
    }
    
    if(!config.auth || valid()) {
        return m.route(prefix("/"));
    }
    
    ctrl.onsubmit = function(e) {
        var form = e.target.elements;
        
        e.preventDefault();
        
        db.authWithPassword({
            email    : form.email.value,
            password : form.password.value
        }, function(error) {
            if(error) {
                ctrl.error = error.message;
                
                return m.redraw();
            }
            
            return m.route(prefix("/"));
        });
    };
    
    if(config.auth !== "password") {
        db.authWithOAuthRedirect(config.auth);
    }
}

export function view(ctrl) {
    if(config.auth === "jwt") {
        if(m.route.param("auth")) {
            return m.component(layout, {
                content : m("div", { class : layout.css.content },
                    m("p", "Validating credentials...")
                )
            });
        }
        
        return m.component(layout, {
            content : m("div", { class : layout.css.content },
                m("p", "Redirecting to login...")
            )
        });
    }
    
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
