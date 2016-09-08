import Firebase from "firebase";
import config from "../config";

var firebase = new Firebase(config.firebase);

firebase.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
window.firebase = firebase;

export default firebase;
