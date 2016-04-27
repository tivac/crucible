var Firebase = require("firebase"),
    firebase;

import config from "../config";

firebase = new Firebase(config.firebase);

firebase.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
window.firebase = firebase;

export default firebase;
