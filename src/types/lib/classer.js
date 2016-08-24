
export default function addClasses(field, cssClasses) {
	var
		currClasses
	;
	
	currClasses = Array.isArray(cssClasses) ? cssClasses : [ cssClasses ];

	// console.log("field.show", field.show);
	if(field.show && field.show.hidden) {
		currClasses.push("hidden");
	}

	return currClasses.join(" ");
}
