import keys from "lodash.mapkeys";
import m from "mithril";
import join from "url-join";

import { root } from "../config";

export function prefix(str) {
    return join(root, str);
}

export function routes(el, fallback, map) {
    m.route(
        el,
        prefix(fallback),
        keys(map, function(value, key) {
            return prefix(key);
        })
    );
}

