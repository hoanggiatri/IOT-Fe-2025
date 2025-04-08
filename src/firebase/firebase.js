// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Add this import
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2kN7PJmw-0RAtLYrt0MyF4VcQj3fIt2g",
  authDomain: "btl-ptit-224d8.firebaseapp.com",
  databaseURL: "https://btl-ptit-224d8-default-rtdb.firebaseio.com",
  projectId: "btl-ptit-224d8",
  storageBucket: "btl-ptit-224d8.firebasestorage.app",
  messagingSenderId: "617544808110",
  appId: "1:617544808110:web:641f1101337a892823df3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app); // Add this line
const db = getFirestore(app);

export { app, auth, database, db }; // Add database to exports