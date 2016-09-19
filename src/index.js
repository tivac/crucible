import m from "mithril";

import config from "./config";

import setup from "./routes/setup";
import normal from "./routes/default";

// Don't actually want the exports, just want them bundled
import "./_global.css";
import "./_pure.css";

// Always route in pathname mode
m.route.prefix("");

(function() {
    if(!config.firebase) {
        return setup();
    }

    return normal();
}());
