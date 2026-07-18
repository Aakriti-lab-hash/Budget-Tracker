// profile.js

import { db } from './firebase-config.js';
import { doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔸 Create Profile
export async function saveUserProfile(uid, name, email, city, country) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    city,
    country
  });
}

// 🔸 Update Profile
export async function updateUserProfile(uid, updatedData) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updatedData);
}