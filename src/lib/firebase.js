import firebase from "firebase";
import config from "../config";

var ref;

firebase.initializeApp(config.firebase);

ref = firebase.database().ref();

ref.TIMESTAMP = firebase.database.ServerValue.TIMESTAMP;

// For debugging
window.db = ref;

// Can't set this up until firebase is initialized, so here seems as good as anything
firebase.auth().onAuthStateChanged(
    function(user) {
        config.user = user;
    },
    function() {
        delete config.user;
    }
);

export default ref;
