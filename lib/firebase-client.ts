"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let firebaseApp

if (typeof window !== "undefined" && !getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else if (typeof window !== "undefined") {
  firebaseApp = getApps()[0]
}

// Initialize Firebase services
export const firebaseAuth = typeof window !== "undefined" ? getAuth(firebaseApp) : undefined
export const firebaseDb = typeof window !== "undefined" ? getFirestore(firebaseApp) : undefined
export const firebaseStorage = typeof window !== "undefined" ? getStorage(firebaseApp) : undefined

// Export the Firebase app instance
export const firebase = firebaseApp
