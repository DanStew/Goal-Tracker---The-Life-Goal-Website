// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_CQ-rK6W3IquBV0cq_p27eOP9I7ERM74",
  authDomain: "goal-tracker-c4455.firebaseapp.com",
  projectId: "goal-tracker-c4455",
  storageBucket: "goal-tracker-c4455.appspot.com",
  messagingSenderId: "170083004676",
  appId: "1:170083004676:web:9e2889b2f42f00b6f3a051",
  measurementId: "G-6MMPJ8NZ23"
};

// Initialize Firebase
//Adding all of the additional firebase functions needed for this application
const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()