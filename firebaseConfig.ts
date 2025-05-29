// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeMcSWzFBv9-0ACp63iOLvbun88e_UwDo",
  authDomain: "libraryapp-21d2c.firebaseapp.com",
  projectId: "libraryapp-21d2c",
  storageBucket: "libraryapp-21d2c.firebasestorage.app",
  messagingSenderId: "384410554787",
  appId: "1:384410554787:web:4234504b1d5c92ac650a16",
  measurementId: "G-G915CWTH1L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);