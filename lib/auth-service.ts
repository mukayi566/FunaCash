import { firebaseAuth } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from "firebase/auth"

// Check if a user with the given email already exists
export async function checkUserExists(email: string) {
  try {
    if (!firebaseAuth) {
      console.error("Firebase Auth is not initialized")
      return {
        success: false,
        error: "Authentication service is not available",
        exists: false,
      }
    }

    const methods = await fetchSignInMethodsForEmail(firebaseAuth, email)
    return {
      success: true,
      exists: methods.length > 0,
    }
  } catch (error: any) {
    console.error("Error checking if user exists:", error)
    return {
      success: false,
      error: error.message || "Failed to check if user exists",
      exists: false,
    }
  }
}

// Create a new user with email and password
export async function createAuthUser(email: string, password: string) {
  try {
    if (!firebaseAuth) {
      console.error("Firebase Auth is not initialized")
      return {
        success: false,
        error: "Authentication service is not available",
      }
    }

    // First check if the user already exists
    const userExistsCheck = await checkUserExists(email)

    if (userExistsCheck.success && userExistsCheck.exists) {
      // If this is a demo email, we'll allow sign in instead of creating a new user
      if (email.includes("test") || email.includes("demo")) {
        const signInResult = await signInAuthUser(email, password)
        if (signInResult.success) {
          return {
            success: true,
            user: signInResult.user,
            message: "Existing demo account signed in",
          }
        }
      }

      return {
        success: false,
        error: "Email is already in use. Please use a different email or try logging in.",
        code: "auth/email-already-in-use",
      }
    }

    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    return {
      success: true,
      user: userCredential.user,
    }
  } catch (error: any) {
    console.error("Error creating auth user:", error)
    return {
      success: false,
      error: error.message || "Failed to create user",
      code: error.code,
    }
  }
}

// Sign in a user with email and password
export async function signInAuthUser(email: string, password: string) {
  try {
    if (!firebaseAuth) {
      console.error("Firebase Auth is not initialized")
      return {
        success: false,
        error: "Authentication service is not available",
      }
    }

    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return {
      success: true,
      user: userCredential.user,
    }
  } catch (error: any) {
    console.error("Error signing in auth user:", error)
    return {
      success: false,
      error: error.message || "Failed to sign in",
      code: error.code,
    }
  }
}

// Sign out the current user
export async function signOutAuthUser() {
  try {
    if (!firebaseAuth) {
      console.error("Firebase Auth is not initialized")
      return {
        success: false,
        error: "Authentication service is not available",
      }
    }

    await signOut(firebaseAuth)
    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error signing out auth user:", error)
    return {
      success: false,
      error: error.message || "Failed to sign out",
    }
  }
}
