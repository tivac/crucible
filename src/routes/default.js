import m from "mithril";
import keys from "lodash.mapkeys";

import prefix from "../lib/prefix.js";
import auth from "../lib/require-auth.js";

import * as home from "../pages/home.js";
import * as login from "../pages/login.js";
import * as logout from "../pages/logout.js";
import * as schemaNew from "../pages/schema-new.js";
import * as schemaEdit from "../pages/schema-edit/index.js";
import * as edit from "../pages/content-edit/index.js";

export default function() {
    m.route(document.body, prefix("/"), keys({
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
    }, function(value, key) {
        return prefix(key);
    }));
}
