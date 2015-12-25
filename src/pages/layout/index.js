"use strict";

var m = require("mithril");

function upgrade(el, init) {
    if(init) {
        return;
    }
    
    componentHandler.upgradeElement(el);
}



module.exports = {
    links : [
        m("a.mdl-navigation__link", { href : "/schemas", config : m.route }, "Schemas"),
        m("a.mdl-navigation__link", { href : "/content", config : m.route }, "Content")
    ],
    
    view : function(ctrl, options) {
        return m(".mdl-layout.mdl-js-layout.mdl-layout--fixed-header", { config : upgrade },
            m("header.mdl-layout__header",
                m(".mdl-layout__header-row",
                    m("span.mdl-layout-title", options.title || "Title"),
                    m(".mdl-layout-spacer"),
                    m("nav.mdl-navigation.mdl-layout--large-screen-only",
                        module.exports.links
                    )
                )
            ),
            m(".mdl-layout__drawer",
                m("span.mdl-layout-title", options.title || "Title"),
                m("nav.mdl-navigation",
                    module.exports.links
                )
            ),
            m("main.mdl-layout__content",
                m(".page-content", options.content)
            )
        );
    }
}
