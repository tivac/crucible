import m from "mithril";

import config from "./config";
import { wait } from "./lib/user.js";

import { routes } from "./lib/routes.js";
import auth from "./lib/require-auth.js";

// Setup pages
import * as setup from "./pages/setup.js";

// Normal pages
import * as home from "./pages/home.js";
import * as login from "./pages/login.js";
import * as logout from "./pages/logout.js";
import * as schemaNew from "./pages/schema-new.js";
import * as schemaEdit from "./pages/schema-edit/index.js";
import * as edit from "./pages/content-edit/index.js";

// Don't actually want the exports, just want them bundled
import "./_global.css";
import "./_pure.css";

// Always route in pathname mode
m.route.mode = "pathname";

function normal() {
    routes(document.body, "/", {
        "/" : auth(home),

        "/login"  : login,
        "/logout" : logout,

        "/content/new" : auth(schemaNew),

        "/content/:schema"      : auth(edit),
        "/content/:schema/edit" : auth(schemaEdit),
        "/content/:schema/:id"  : auth(edit),
    
        "/..." : {
            view : function() {
                return m("h1", "404");
            }
        }
    });
}

(function() {
    if(!config.firebase) {
        return routes(document.body, "/setup", {
            "/setup" : setup
        });
    }

    return wait().then(normal).catch(normal);
}());
