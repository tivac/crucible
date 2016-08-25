
export default function addClasses(field, cssClasses) {
    var currClasses = Array.isArray(cssClasses) ? cssClasses : [ cssClasses ];
    
    if(field.show && field.show.hidden) {
        currClasses.push("hidden");
    }

    return currClasses.join(" ");
}
