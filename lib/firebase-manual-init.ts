import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// This is a temporary solution for testing purposes
// Replace these values with your actual Firebase config for testing
// DO NOT commit this file with real values to your repository
const manualConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

// Initialize Firebase manually
export function initializeFirebaseManually() {
  try {
    const app = initializeApp(manualConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log("Firebase manually initialized successfully")

    return { app, auth, db, success: true }
  } catch (error) {
    console.error("Error manually initializing Firebase:", error)
    return { app: null, auth: null, db: null, success: false }
  }
}
