import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tata-s-photography.firebaseapp.com",
  projectId: "tata-s-photography",
  storageBucket: "tata-s-photography.appspot.com",
  messagingSenderId: "882623239114",
  appId: "1:882623239114:web:08c807c7c9705dea657533",
  measurementId: "G-RGKVDBCEMC"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, storage, auth, app };
