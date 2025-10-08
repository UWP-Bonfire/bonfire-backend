import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";

const firebaseConfig = {
  projectId: "bonfire-d8db1",
  appId: "1:474303125087:web:5975834a255a3352b16dea",
  storageBucket: "bonfire-d8db1.firebasestorage.app",
  apiKey: "AIzaSyBNYJONgRNxNMcKgeCDrFQfWH4S8Lw2zYo",
  authDomain: "bonfire-d8db1.firebaseapp.com",
  messagingSenderId: "474303125087",
  measurementId: "G-MKV9G5Z9Z4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Explicitly enable the network for Firestore
enableNetwork(firestore);

export { auth, firestore };
