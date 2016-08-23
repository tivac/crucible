import m from "mithril";
import get from "lodash.get";
    
var field = [ "show", "field" ],
    
    hiddenEl = m("div", { class : "hidden" });

/**
 * {
 *     "Image Type": {
 *         type : "select",
 *         options : {
 *             "none": "none",
 *             "icon": "icon",
 *             "background": "background"
 *         }
 *     },
 *     "Image Url" : {
 *         show : {
 *             field : "Image Type",
 *             value : /(icon)|(background)/
 *         },
 *         type : "upload",
 *         ws   : "https://cms-dev.ncplatform.net/upload/url?instance=loading-info" // What is "ws"? Websocket?
 *     }
 * }
 *
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

    src = options.field.show.value;
    tgt = get(options.state, dependsOn);

    // No target value, so have to hide it
    if(typeof tgt === "undefined" || tgt === null) {
        return hiddenEl;
    }
    
    // RegExp matched
    // * If needed, `field.show.type` will be set to "regexp" by `parse-schema.js`
    if(options.field.show.type === "regexp") {
        src = new RegExp(src, "i");
        
        if(src.test(tgt)) {
            return false;
        }
    }
    
    // Values match-ish
    // eslint-disable-next-line eqeqeq
    if(src == tgt) {
        return false;
    }
    
    // Otherwise this field should hide
    return hiddenEl;
}
