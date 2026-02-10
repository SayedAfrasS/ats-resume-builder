import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJBrp9zI89cj7kgDGJQRc7D4mZK4MpdSg",
  authDomain: "spellfolio.firebaseapp.com",
  projectId: "spellfolio",
  storageBucket: "spellfolio.firebasestorage.app",
  messagingSenderId: "44512151973",
  appId: "1:44512151973:web:5150e8c9b189c06743804c",
  measurementId: "G-20QV4HHHTQ",
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
