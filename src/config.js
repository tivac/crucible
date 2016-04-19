import url from "url";

export default global.anthracite || {};

export var root = url.parse(document.baseURI).pathname;
export var icons = document.baseURI + "gen/icons.svg";
export var title = document.title;

