import m from "mithril";
import get from "lodash.get";

import css from "./types.css";
    
var dependentField = [ "show", "field" ],

    hiddenClass = css.hidden
    ;
    
    // hiddenEl = m("div", { class : "hidden" });

/**
 * See README for example schema with a hidden/dependent field.
 */

 function isHidden(field) {
    field.show.prevHidden = true;
    return hiddenClass;
 }

 function notHidden(field) {
    field.show.prevHidden = false;
    return "";
 }

export default function(state, field) {
    /* eslint: eqeqeq:0 */
    var dependsOn = get(field, dependentField),
        src,
        tgt;

    // No conditional visibility config or missing target field
    if(!dependsOn) {
        return null;
    }

    // eslint-disable-next-line eqeqeq
    if(field.show.prevHidden != null) {
        console.log("field.show.prevHidden", field.show.prevHidden);
    }


    src = field.show.value;
    tgt = get(state, dependsOn);

    // No target value, so have to hide it
    if(typeof tgt === "undefined" || tgt === null) {
        return isHidden(field);
    }
    
    // RegExp matched
    // * If appropriate, `field.show.type` will be set to "regexp" by `parse-schema.js`
    if(field.show.type === "regexp") {
        src = new RegExp(src, "i");
        
        if(src.test(tgt)) {
            return notHidden(field);
        }
    }
    
    // Values match-ish
    // eslint-disable-next-line eqeqeq
    if(src == tgt) {
        return notHidden(field);
    }
    
    // Otherwise this field should hide
    return isHidden(field);
}
