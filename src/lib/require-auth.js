import m from "mithril";

import config from "../config";
import valid from "./valid-auth";
import prefix from "./prefix";

export default function(component, r) {
    console.log("r", r);
    return {
        controller : function() {
            /* eslint consistent-return: 0 */
            if(config.auth && !valid()) {
                return m.route(prefix("/login") + window.location.search);
            }
        },

        view : function() {
            return m.component(component);
        }
    };
}
