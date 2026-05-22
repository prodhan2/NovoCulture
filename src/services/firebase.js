import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD0c86rYuGITPhl6KfViF6uhDOpZxq88wE",
  authDomain: "novoculture-4b74d.firebaseapp.com",
  projectId: "novoculture-4b74d",
  storageBucket: "novoculture-4b74d.firebasestorage.app",
  messagingSenderId: "1062109936378",
  appId: "1:1062109936378:web:f4b4a92455f759f4b66743",
  measurementId: "G-7KQ62G9WVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, db, auth, googleProvider, analytics };
