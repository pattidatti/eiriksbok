
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDCO1pb9TqjM1vn1alm3xFA_2vfcgyyD-k",
    authDomain: "eiriksbok.firebaseapp.com",
    databaseURL: "https://eiriksbok-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "eiriksbok",
    storageBucket: "eiriksbok.firebasestorage.app",
    messagingSenderId: "1060758227538",
    appId: "1:1060758227538:web:35711302bfdd046201ed8b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("Attempting to write to Firebase...");

const testRef = ref(db, 'test_write_' + Date.now());

set(testRef, {
    test: true,
    timestamp: Date.now()
})
    .then(() => {
        console.log("SUCCESS: Write successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("ERROR: Write failed.");
        console.error(error.message); // Should print permission denied
        // console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    });
