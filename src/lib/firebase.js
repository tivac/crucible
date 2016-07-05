import firebase from "firebase";
import config from "../config";

var ref;

firebase.initializeApp(config.firebase);

ref = firebase.database().ref();

ref.TIMESTAMP = firebase.ServerValue.TIMESTAMP;

// For debugging
window.firebase = ref;

export default ref;
