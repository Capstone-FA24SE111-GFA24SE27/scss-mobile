// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDY91T99SNrqrGj9C9NBgL9iCE-0oVL7wA",
  authDomain: "scss-e9511.firebaseapp.com",
  projectId: "scss-e9511",
  storageBucket: "scss-e9511.firebasestorage.app",
  messagingSenderId: "300198556722",
  appId: "1:300198556722:web:15802cf8af7d327292382b",
  measurementId: "G-XFPTWZ59QK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
