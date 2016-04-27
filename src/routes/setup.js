import m from "mithril";
import keys from "lodash.mapkeys";

import prefix from "../lib/prefix";
import * as setup from "../pages/setup.js";

export default function() {
    m.route(
        document.body,
        prefix("/setup"),
        keys({
            "/setup" : setup
        }, function(value, key) {
            return prefix(key);
        })
    );
}
