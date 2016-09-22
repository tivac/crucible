import m from "mithril";

import db from "../lib/firebase";
import prefix from "../lib/prefix";

export function controller() {
    db.unauth();
    
    m.route.set(prefix("/"));
}
