import m from "mithril";
import get from "lodash.get";
    
var field = [ "show", "field" ],
    
    hiddenEl = m("div", { class : "hidden" });

/**
 * See README for example schema with a hidden/dependent field.
 */

export default function(options) {
    /* eslint: eqeqeq:0 */
    var dependsOn = get(options.field, field),
        src,
        tgt;

    // No conditional visibility config or missing target field
    if(!dependsOn) {
        return false;
    }

    // eslint-disable-next-line eqeqeq
    if(options.field.show.prevHidden != null) {
        console.log("field.show.prevHidden", options.field.show.prevHidden);
    }

    src = options.field.show.value;
    tgt = get(options.state, dependsOn);

    // No target value, so have to hide it
    if(typeof tgt === "undefined" || tgt === null) {
        options.field.show.prevHidden = true;
        return hiddenEl;
    }
    
    // RegExp matched
    // * If appropriate, `field.show.type` will be set to "regexp" by `parse-schema.js`
    if(options.field.show.type === "regexp") {
        src = new RegExp(src, "i");
        
        if(src.test(tgt)) {
            options.field.show.prevHidden = false;
            return false;
        }
    }
    
    // Values match-ish
    // eslint-disable-next-line eqeqeq
    if(src == tgt) {
        options.field.show.prevHidden = false;
        return false;
    }
    
    // Otherwise this field should hide
    options.field.show.prevHidden = true;
    return hiddenEl;
}
