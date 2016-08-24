import m from "mithril";
import assign from "lodash.assign";

import css from "./select.css";
import multiple from "./lib/multiple.js";

function findSelected(children) {
    return children.find((option) => option.selected);
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

        console.log("options.hidden", options.hidden);

        if(hasSelected) {
            // If the schema defines a selected option, set the value immediately.
            ctrl.value(options, hasSelected.key, hasSelected.value);
            optionObjs = children;
        } else {
            // If there is no selected option defined by the schema,
            // then prepend a default "Please select..." option.
            optionObjs = [ pleaseSelect() ].concat(children);

            // Which means we need to add an offset (via indexOffset)
            // to the lookup-by-index that occurs in the `onchange` handler
            indexOffset = -1;
        }

        var result = m("select", assign({
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

        // debugger; 

        return result;
    }
);
