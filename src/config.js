import url from "url";
import assign from "lodash.assign";
import join from "url-join";

export var root = url.parse(document.baseURI).pathname;
export var icons = join(document.baseURI, "/gen/icons.svg");
export var title = document.title;

export default assign({}, window.anthracite || {});
