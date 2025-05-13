"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase config
const validateFirebaseConfig = () => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

  const missingFields = requiredFields.filter((field) => !firebaseConfig[field as keyof typeof firebaseConfig])

  if (missingFields.length > 0) {
    console.error(`Missing Firebase config fields: ${missingFields.join(", ")}`)
    return false
  }

  return true
}

// Initialize Firebase
let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let firebaseDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null
let firebaseError: string | null = null
let firebaseAuth: Auth | null = null

try {
  if (validateFirebaseConfig()) {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig)
    } else {
      firebaseApp = getApps()[0]
    }

    // Initialize Firebase services
    auth = getAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)
    firebaseStorage = getStorage(firebaseApp)
    firebaseAuth = auth
  } else {
    firebaseApp = null
    auth = null
    firebaseDb = null
    firebaseStorage = null
    firebaseAuth = null
    firebaseError = "Invalid Firebase configuration"
    console.error("Firebase initialization error: Invalid Firebase configuration")
  }
} catch (e: any) {
  firebaseApp = null
  auth = null
  firebaseDb = null
  firebaseStorage = null
  firebaseAuth = null
  firebaseError = e.message
  console.error("Firebase initialization error", e)
}

// Export Firebase services
export { firebaseApp, auth, firebaseAuth, firebaseDb, firebaseStorage, firebaseError }
