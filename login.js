// login.js (Firebase v10 module-based setup)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, "users", user.uid), {
        firstName: username,
        email: email,
        createdAt: new Date()
      });

      await sendEmailVerification(user);
      alert("Registration successful! Please verify your email.");
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        alert("Login successful!");
        window.location.href = "home.html";
      } else {
        alert("Please verify your email first.");
        await signOut(auth);
      }
    } catch (error) {
      alert(error.message);
    }
  });
}

// Forgot Password
const forgotLink = document.getElementById("forgotPasswordLink");
if (forgotLink) {
  forgotLink.addEventListener("click", async () => {
    const email = prompt("Enter your registered email:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent!");
      } catch (error) {
        alert(error.message);
      }
    }
  });
}

// Toggle login/register
const container = document.querySelector(".container");
const loginBtn = document.querySelector(".login-btn");
const registerBtn = document.querySelector(".register-btn");

if (loginBtn && container) {
  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
  });
}

if (registerBtn && container) {
  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
  });
}