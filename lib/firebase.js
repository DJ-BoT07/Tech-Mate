// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqHOFNwAo8AoTyuUmXKsG9C8Nt8HHXFRI",
  authDomain: "techmate-ba941.firebaseapp.com",
  projectId: "techmate-ba941",
  storageBucket: "techmate-ba941.firebasestorage.app",
  messagingSenderId: "441514746985",
  appId: "1:441514746985:web:fab9aa211f79ed92c66ef8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
};