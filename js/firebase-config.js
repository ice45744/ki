import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firebase configuration
// IMPORTANT: These are public development keys for the Student Council system.
const firebaseConfig = {
  apiKey: "AIzaSyCGnKFR-bmf4t0xXb53iOgp8mHB6RkIOeg",
  authDomain: "student-council-d3c27.firebaseapp.com",
  projectId: "student-council-d3c27",
  storageBucket: "student-council-d3c27.firebasestorage.app",
  messagingSenderId: "766262044382",
  appId: "1:766262044382:web:d86c252ca307a51580844f"
};

export const app = initializeApp(firebaseConfig);
export default firebaseConfig;