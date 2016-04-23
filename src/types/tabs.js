var m      = require("mithril"),
    assign = require("lodash.assign");
    
import hide from "./lib/hide";

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
    var tabs   = options.field.children || [],
        hidden = hide(options);
        
    if(hidden) {
        return hidden;
    }
    
    return m("div", { class : options.class },
        m("div", { class : css.nav },
            tabs.map(function(tab, idx) {
                return m("a", {
                        class   : css[idx === ctrl.tab ? "active" : "inactive"],
                        href    : "#" + idx,
                        onclick : ctrl.switchtab.bind(ctrl, idx)
                    }, tab.name
                );
            })
        ),
        tabs.map(function(tab, idx) {
            return m("div", { class : css[idx === ctrl.tab ? "contents-active" : "contents"] },
                m.component(children, assign({}, options, {
                    class  : false,
                    fields : tab.children,
                    data   : options.data && options.data[tab.key],
                    path   : options.path.concat(tab.key)
                }))
            );
        })
    );
}
