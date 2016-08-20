import m from "mithril";
import assign from "lodash.assign";

import css from "./select.css";
import multiple from "./lib/multiple.js";

function findSelected(children) {
    return children.find((option) => Boolean(option.selected));
}

function pleaseSelect() {
    return {
        attrs    : {},
        name     : "Please select an option...",
        value    : "",
        selected : true
    };
}

export default multiple({
        multiple : false
    },

    function(ctrl, options, children) {
        var field = options.field,
            hasSelected = findSelected(children),
            indexOffset = 0,
            optionObjs;

        if(hasSelected) {
            // If the schema defines a selected option, don't
            // add a "please select" but do set the value immediately.
            optionObjs = children;
            ctrl.value(options, hasSelected.key, hasSelected.value);
        } else {
            // If we prepend a "please select" el, we need to
            // adjust the index lookup in `onchange` via indexOffset
            optionObjs = [ pleaseSelect() ].concat(children);
            indexOffset = -1;
        }

        return m("select", assign({
                // attrs
                class : css.select,

                // events
                onchange : function(e) {
                    var tgt = e.target,
                        opt = children[tgt.selectedIndex + indexOffset];

                    ctrl.value(options, opt.key, opt.value);
                }
            }, field.attrs),
            
            optionObjs.map(function(option) {
                return m("option", assign({}, option.attrs, {
                        value    : option.value,
                        selected : option.selected ? "selected" : null
                    }),
                    option.name
                );
            })
        );
    }
);
