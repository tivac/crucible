import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children";
import css from "./tabs.css";

export default {
    oninit : function() {
        var ctrl = this;

        ctrl.tab = 0;

        ctrl.switchtab = function(tab, e) {
            e.preventDefault();

            ctrl.tab = tab;
        };
    },

    view : function(vnode) {
        var tabs   = vnode.attrs.field.children || [];
        
        return m("div", { class : vnode.attrs.class },
            m("div", { class : css.nav },
                tabs.map(function(tab, idx) {
                    return m("a", {
                            class   : css[idx === vnode.state.tab ? "activetab" : "tab"],
                            href    : "#" + idx,
                            onclick : vnode.state.switchtab.bind(vnode.state, idx)
                        }, tab.name
                    );
                })
            ),
            tabs.map(function(tab, idx) {
                return m("div", { class : css[idx === vnode.state.tab ? "activebody" : "body"] },
                    m(children, assign({}, vnode.attrs, {
                        class  : false,
                        fields : tab.children,
                        data   : vnode.attrs.data && vnode.attrs.data[tab.key],
                        path   : vnode.attrs.path.concat(tab.key)
                    }))
                );
            })
        );
    }
};
