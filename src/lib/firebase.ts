import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDsLBMd43X4H9whZLiFlunRbrIdtjgYGG0",
    authDomain: "encryptid-finale.firebaseapp.com",
    projectId: "encryptid-finale",
    storageBucket: "encryptid-finale.appspot.com",
    messagingSenderId: "589918702866",
    appId: "1:589918702866:web:a81ee24d084fe3264a77cb",
    measurementId: "G-RWLL783JRN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();