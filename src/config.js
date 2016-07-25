import url from "url";
import assign from "lodash.assign";
import join from "url-join";


export default assign({}, window.anthracite || {}, {
    root  : url.parse(document.baseURI).pathname,
    icons : join(document.baseURI, "/gen/icons.svg"),
    title : document.title
});
