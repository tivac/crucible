import url from "url";

var config = global.anthracite || {};

config.root = url.parse(document.baseURI).pathname;
config.icons = document.baseURI + "gen/icons.svg";
config.title = document.title;

export default config;
