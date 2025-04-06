import { initializeApp } from "firebase/app";
import { getApp ,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCcgCBDdYy5s7KQRO_s2BA1vjucCBP6gr0",
  authDomain: "mockbot-c640f.firebaseapp.com",
  projectId: "mockbot-c640f",
  storageBucket: "mockbot-c640f.firebasestorage.app",
  messagingSenderId: "80961978098",
  appId: "1:80961978098:web:21e281afb339ebc6d65a6b",
  measurementId: "G-VKE7GQL5M5"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);