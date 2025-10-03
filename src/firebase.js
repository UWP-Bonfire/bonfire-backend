
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "bonfire-d8db1",
  appId: "1:474303125087:web:5975834a255a3352b16dea",
  databaseURL: "https://bonfire-d8db1-default-rtdb.firebaseio.com",
  storageBucket: "bonfire-d8db1.firebasestorage.app",
  apiKey: "AIzaSyBNYJONgRNxNMcKgeCDrFQfWH4S8Lw2zYo",
  authDomain: "bonfire-d8db1.firebaseapp.com",
  messagingSenderId: "474303125087",
  measurementId: "G-MKV9G5Z9Z4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
