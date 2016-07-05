import db from "./firebase";

// Ensure the updated timestamp is always accurate-ish
export default function(ref) {
    var uid = firebase.auth().currentUser.uid;

    ref.on("child_changed", function(snap) {
        var key = snap.key;
        
        // Avoid looping forever
        if(key === "updated_at" || key === "updated_by") {
            return;
        }
        
        // Clean up any old updated timestamps floating around
        ref.child("updated").remove();
        
        ref.update({
            updated_at : db.TIMESTAMP,
            updated_by : uid
        });
    });
}
