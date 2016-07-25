import firebase from "firebase";

import config from "../config";

export let app = firebase.initializeApp(config.firebase);
export let ref = app.database().ref();
export let timestamp = firebase.database.ServerValue.TIMESTAMP;

// For debugging
window.fb = {
    app : app,
    ref : ref
};
