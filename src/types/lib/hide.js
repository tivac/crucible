// import m from "mithril";
import get from "lodash.get";
    
var dependentField = [ "show", "field" ];

/**
 * See README for example schema with a hidden/dependent field.
 */

export default function checkIsHidden(state, field) {
    var dependsOn = get(field, dependentField),
        src,
        tgt;

    // No conditional visibility config or missing target field
    if(!dependsOn) {
        return field;
    }

    src = field.show.value;
    tgt = get(state, dependsOn);

    // No target value, so have to hide it
    if(typeof tgt === "undefined" || tgt === null) {
        field.show.hidden = true;
        return field;
    }
    
    // RegExp matched
    // * If appropriate, `field.show.type` will be set to "regexp" by `parse-schema.js`
    if(field.show.type === "regexp") {
        src = new RegExp(src, "i");
        
        if(src.test(tgt)) {
            field.show.hidden = false;
            return field;
        }
    }
    
    // Values match-ish
    // eslint-disable-next-line eqeqeq
    if(src == tgt) {
        field.show.hidden = false;
        return field;
    }
    
    // Otherwise this field should hide
    field.show.hidden = true;
    return field;
}
