import join from "url-join";
import {root} from "../config";

export default function path(str) {
    return join(root, str);
}
