import url from "url";
import assign from "lodash.assign";

var config = assign({}, window.anthracite || {});

export var root = url.parse(document.baseURI).pathname;
export var icons = document.baseURI + "gen/icons.svg";
export var title = document.title;

export default config;
