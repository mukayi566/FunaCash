"use server"
import { cookies } from "next/headers"
import { firebaseAuth, firebaseDb } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc, query, where, getDocs, collection } from "firebase/firestore"

export async function signIn(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    // Get user data from Firestore based on username
    const usersQuery = query(collection(firebaseDb, "users"), where("username", "==", username))
    const usersSnapshot = await getDocs(usersQuery)

    if (usersSnapshot.empty) {
      return { error: "Invalid username or password. Please try again." }
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()

    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, userData.email, password)
    const user = userCredential.user

    // Set cookies
    cookies().set("user_id", user.uid)
    cookies().set("user_role", userData.role || "customer")
    cookies().set("user_authenticated", "true")

    // Return success with redirect path instead of redirecting directly
    if (userData.role === "agent") {
      return { success: true, redirectTo: "/dashboard/agent" }
    } else {
      return { success: true, redirectTo: "/dashboard/customer" }
    }
  } catch (error: any) {
    console.error("Error during sign in:", error)

    // Handle specific Firebase auth errors
    if (error.code === "auth/invalid-credential") {
      return { error: "Invalid username or password. Please try again." }
    } else if (error.code === "auth/user-disabled") {
      return { error: "This account has been disabled. Please contact support." }
    } else if (error.code === "auth/user-not-found") {
      return { error: "No account found with this username. Please sign up." }
    } else if (error.code === "auth/wrong-password") {
      return { error: "Incorrect password. Please try again." }
    } else if (error.code === "auth/too-many-requests") {
      return { error: "Too many failed login attempts. Please try again later." }
    }

    return { error: "An error occurred during sign in. Please try again." }
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
  const username = formData.get("username") as string // ADDED: Get username from form

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
      username, // ADDED: Save username to Firestore
    })

    // Redirect to login page after successful registration
    return {
      success: true,
      redirectTo: "/auth/login",
    }
  } catch (error: any) {
    console.error("Error during registration:", error)

    // Handle specific Firebase auth errors
    if (error.code === "auth/email-already-in-use") {
      return { success: false, message: "This email is already in use. Please try logging in." }
    } else if (error.code === "auth/invalid-email") {
      return { success: false, message: "Invalid email address format." }
    } else if (error.code === "auth/weak-password") {
      return { success: false, message: "Password is too weak. Please use a stronger password." }
    } else if (error.code === "auth/network-request-failed") {
      return {
        success: false,
        message:
          "A network error occurred. Please check your internet connection and try again. If the problem persists, please contact support.",
      }
    } else if (error.code === "auth/internal-error") {
      return { success: false, message: "Firebase internal error. Please try again later." }
    }

    return { success: false, message: "An error occurred during registration. Please try again." }
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
    // Even if Firebase signOut fails, we've already cleared cookies
    return { success: true, redirectTo: "/" }
  }
}
