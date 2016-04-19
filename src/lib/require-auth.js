import m from "mithril";
import {auth} from "../config";
import valid from "./valid-auth";
import prefix from "./prefix";

export default function(component) {
    return {
        controller : function() {
            /* eslint consistent-return: 0 */
            if(auth && !valid()) {
                return m.route(prefix("/login") + window.location.search);
            }
        },

        view : function() {
            return m.component(component);
        }
    };
};
