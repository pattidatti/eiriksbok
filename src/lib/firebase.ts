import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDCO1pb9TqjM1vn1alm3xFA_2vfcgyyD-k",
    authDomain: "eiriksbok.firebaseapp.com",
    databaseURL: "https://eiriksbok-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "eiriksbok",
    storageBucket: "eiriksbok.firebasestorage.app",
    messagingSenderId: "1060758227538",
    appId: "1:1060758227538:web:35711302bfdd046201ed8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

export default app;
