// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtFhOVU83gmcqbFIGPHA-Zz0vYOnkgJFU",
  authDomain: "iot-2025-b4c55.firebaseapp.com",
  projectId: "iot-2025-b4c55",
  storageBucket: "iot-2025-b4c55.firebasestorage.app",
  messagingSenderId: "905797016178",
  appId: "1:905797016178:web:945dbce2eaa7892a0300eb",
  measurementId: "G-CYG1VRC5B4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };