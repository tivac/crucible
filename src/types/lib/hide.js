// import m from "mithril";
import get from "lodash.get";
    
var dependentField = [ "show", "field" ];

/**
 * See README for example schema with a hidden/dependent field.
 */

function rxStringTest(str, rx) {
    return typeof str === "string" && rx.test(str);
}

 function rxFindMatch(src, tgt) {
    var rxSrc = new RegExp(src, "i"),
        vals;
    
    if(rxStringTest(tgt, rxSrc)) {
        return true;
    }

    vals = Array.isArray(tgt) ?
        tgt :
        Object.keys(tgt).map((key) => tgt[key]);

    if(vals.find((str) => rxStringTest(str, rxSrc))) {
        return true;
    }

    return false;
 }

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

    field.show.prevHidden = Boolean(field.show.hidden);

    // No target value, so have to hide it
    if(typeof tgt === "undefined" || tgt === null) {
        field.show.hidden = true;
        return field;
    }
    
    // RegExp matched
    // * If appropriate, `field.show.type` will be set to "regexp" by `parse-schema.js`
    if(field.show.type === "regexp" && rxFindMatch(src, tgt)) {
        field.show.hidden = false;
        return field;
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
