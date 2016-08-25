import get from "lodash.get";

/**
 * See README for example schema with a hidden/dependent field.
 */

 function rxFindMatch(src, target) {
    var rx = new RegExp(src, "i"),
        vals,
        found;
    
    if(rx.test(target)) {
        return true;
    }

    if(Array.isArray(target)) {
        vals = target;
    } else {
        vals = Object.keys(target).map(function(key) {
            return target[key];
        });
    }

    found = vals.find(function(str) {
        return rx.test(str);
    });

    return found;
 }

export default function checkHidden(state, field) {
    var dependsOn = get(field, [ "show", "field" ]),
        src,
        target;

    // No conditional show config, or missing target field
    if(!dependsOn) {
        return false;
    }

    src = field.show.value;
    target = get(state, dependsOn);

    // No target value, so have to hide it
    if(typeof target === "undefined" || target === null) {
        return true;
    }
    
    // RegExp matched
    // * If appropriate, `field.show.type` will be set to "regexp" by `parse-schema.js`
    if(field.show.type === "regexp" && rxFindMatch(src, target)) {
        return false;
    }
    
    // Values match-ish
    // eslint-disable-next-line eqeqeq
    if(src == target) {
        return false;
    }
    
    // Otherwise this field should hide
    return true;
}
