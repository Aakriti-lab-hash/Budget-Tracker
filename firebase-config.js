
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGHy6dFx659oXQF_UtRxGhcLV4pie461I",
  authDomain: "budget-tracker-41390.firebaseapp.com",
  projectId: "budget-tracker-41390",
  storageBucket: "budget-tracker-41390.firebasestorage.app",
  messagingSenderId: "10009807468",
  appId: "1:10009807468:web:a4c81c9881b1c006496649"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
