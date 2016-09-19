import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children";
import css from "./tabs.css";

export function controller() {
    var ctrl = this;

    ctrl.tab = 0;

    ctrl.switchtab = function(tab, e) {
        e.preventDefault();

        ctrl.tab = tab;
    };
}

export function view(ctrl, options) {
    var tabs   = options.field.children || [];
    
    return m("div", { class : options.class },
        m("div", { class : css.nav },
            tabs.map(function(tab, idx) {
                return m("a", {
                        class   : css[idx === ctrl.tab ? "activetab" : "tab"],
                        href    : "#" + idx,
                        onclick : ctrl.switchtab.bind(ctrl, idx)
                    }, tab.name
                );
            })
        ),
        tabs.map(function(tab, idx) {
            return m("div", { class : css[idx === ctrl.tab ? "activebody" : "body"] },
                m(children, assign({}, options, {
                    class  : false,
                    fields : tab.children,
                    data   : options.data && options.data[tab.key],
                    path   : options.path.concat(tab.key)
                }))
            );
        })
    );
}
