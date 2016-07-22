import firebase from "firebase";

var app, ref;

export function connect(config) {
    app = firebase.initializeApp(config);
    ref = app.database().ref();
    ref.TIMESTAMP = firebase.database.ServerValue.TIMESTAMP;

    // For debugging
    window.app = app;
    window.db = ref;
}

export default { app, ref };
