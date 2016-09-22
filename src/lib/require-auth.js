import m from "mithril";

import config from "../config";
import valid from "./valid-auth";
import prefix from "./prefix";

export default function(component) {
    return {
        oninit : function() {
            /* eslint consistent-return: 0 */
            if(config.auth && !valid()) {
                return m.route.set(prefix("/login") + window.location.search);
            }
        },

        view : function() {
            return m(component);
        }
    };
}
