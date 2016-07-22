import m from "mithril";

import db from "../lib/firebase.js";
import { prefix } from "../lib/routes.js";

export function controller() {
    db.unauth();
    
    m.route(prefix("/"));
}
