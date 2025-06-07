"use server"
import { cookies } from "next/headers"
import { firebaseAuth, firebaseDb } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc, query, where, getDocs, collection } from "firebase/firestore"
import { rateLimitService } from "@/lib/rate-limit-service"
import { authLogger } from "@/lib/auth-logger"

export async function signIn(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    authLogger.logSignInFailure(username || "unknown", "missing_credentials", "Username and password are required")
    return {
      error: "Username and password are required",
      errorCode: "missing_credentials",
    }
  }

  if (rateLimitService.isBlocked(username)) {
    const remainingTime = rateLimitService.getRemainingBlockTime(username)
    authLogger.logRateLimitTriggered(username, remainingTime)

    const minutes = Math.ceil(remainingTime / 60000)
    return {
      error: "Too many failed attempts. Please try again in " + minutes + " minutes.",
      errorCode: "rate_limited",
      rateLimited: true,
      retryAfter: remainingTime,
    }
  }

  authLogger.logSignInAttempt(username, { timestamp: new Date().toISOString() })

  try {
    const usersQuery = query(collection(firebaseDb, "users"), where("username", "==", username))
    const usersSnapshot = await getDocs(usersQuery)

    if (usersSnapshot.empty) {
      const rateLimitResult = rateLimitService.recordAttempt(username, false)
      authLogger.logSignInFailure(username, "user_not_found", "Invalid username or password")

      return {
        error: "Invalid username or password. Please check your credentials and try again.",
        errorCode: "invalid_credentials",
        remainingAttempts: rateLimitResult.remainingAttempts,
        rateLimited: rateLimitResult.blocked,
        blockDuration: rateLimitResult.blockDuration,
      }
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()

    const userCredential = await signInWithEmailAndPassword(firebaseAuth, userData.email, password)
    const user = userCredential.user

    rateLimitService.recordAttempt(username, true)
    authLogger.logSignInSuccess(username, userData.email)

    cookies().set("user_id", user.uid)
    cookies().set("user_role", userData.role || "customer")
    cookies().set("user_authenticated", "true")

    if (userData.role === "agent") {
      return { success: true, redirectTo: "/dashboard/agent" }
    } else {
      return { success: true, redirectTo: "/dashboard/customer" }
    }
  } catch (error: any) {
    const rateLimitResult = rateLimitService.recordAttempt(username, false)

    let errorMessage = "An error occurred during sign in. Please try again."
    let errorCode = "unknown_error"

    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        errorMessage = "Invalid username or password. Please check your credentials and try again."
        errorCode = "invalid_credentials"
        break
      case "auth/user-disabled":
        errorMessage = "This account has been disabled. Please contact support for assistance."
        errorCode = "account_disabled"
        break
      case "auth/user-not-found":
        errorMessage = "No account found with this username. Please check your username or sign up for a new account."
        errorCode = "user_not_found"
        break
      case "auth/too-many-requests":
        errorMessage = "Too many failed login attempts. Please try again later or reset your password."
        errorCode = "too_many_requests"
        break
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection and try again."
        errorCode = "network_error"
        break
      case "auth/internal-error":
        errorMessage = "A server error occurred. Please try again in a few moments."
        errorCode = "server_error"
        break
      case "auth/invalid-email":
        errorMessage = "Invalid email format. Please check your credentials."
        errorCode = "invalid_email"
        break
      default:
        errorMessage = "An unexpected error occurred. Please try again."
        errorCode = "unexpected_error"
    }

    authLogger.logSignInFailure(username, errorCode, errorMessage, {
      firebaseErrorCode: error.code,
      firebaseErrorMessage: error.message,
    })

    return {
      error: errorMessage,
      errorCode,
      remainingAttempts: rateLimitResult.remainingAttempts,
      rateLimited: rateLimitResult.blocked,
      blockDuration: rateLimitResult.blockDuration,
    }
  }
}

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const country = formData.get("country") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const username = formData.get("username") as string

  if (!email || !password || !username) {
    return { success: false, message: "Email, password, and username are required" }
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    const user = userCredential.user

    await setDoc(doc(firebaseDb, "users", user.uid), {
      firstName,
      lastName,
      email,
      phone,
      country,
      role: role || "customer",
      balance: 0,
      createdAt: new Date(),
      username,
    })

    authLogger.logSignInSuccess(username, email)

    return {
      success: true,
      redirectTo: "/auth/login",
    }
  } catch (error: any) {
    console.error("Error during registration:", error)

    let errorMessage = "An error occurred during registration. Please try again."

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already in use. Please try logging in or use a different email."
        break
      case "auth/invalid-email":
        errorMessage = "Invalid email address format."
        break
      case "auth/weak-password":
        errorMessage = "Password is too weak. Please use a stronger password with at least 6 characters."
        break
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection and try again."
        break
      case "auth/internal-error":
        errorMessage = "A server error occurred. Please try again in a few moments."
        break
    }

    return { success: false, message: errorMessage }
  }
}

export async function logoutUser() {
  cookies().delete("user_id")
  cookies().delete("user_role")
  cookies().delete("user_authenticated")

  try {
    await signOut(firebaseAuth)
    return { success: true, redirectTo: "/" }
  } catch (error: any) {
    console.error("Error during logout:", error)
    return { success: true, redirectTo: "/" }
  }
}
