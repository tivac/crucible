import url from "url";
import assign from "lodash.assign";
import join from "url-join";

export var root = url.parse(document.baseURI).pathname,
           icons = join(document.baseURI, "/gen/icons.svg"),
           title = document.title;

export default assign({}, window.anthracite || {});
