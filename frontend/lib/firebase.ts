import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAom58-XFC4yvjYiaIiPYpoilRVgB5E29g",
  authDomain: "temp-bfe41.firebaseapp.com",
  projectId: "temp-bfe41",
  storageBucket: "temp-bfe41.firebasestorage.app",
  messagingSenderId: "164107786597",
  appId: "1:164107786597:web:3b7bf5d16a816539d4e98c",
  measurementId: "G-08T0YPEQ7J",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
