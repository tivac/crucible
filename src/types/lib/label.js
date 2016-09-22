import m from "mithril";

import css from "./types.css";
 
export default function(vnode) {
    var field = vnode.attrs.field,
        name  = field.name,
        style = css.label;
    
    if(field.required) {
        name += "*";
        style = css.required;
    }
     
    return m("label", {
        for   : vnode.state.id,
        class : style
    }, name);
};
