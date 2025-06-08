"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createUser, getUserByUsername } from "@/lib/supabase/database"

export async function signIn(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return {
      error: "Username and password are required",
      errorCode: "missing_credentials",
    }
  }

  try {
    // Get user by username to find their email
    const userData = await getUserByUsername(username)

    if (!userData) {
      return {
        error: "Invalid username or password. Please check your credentials and try again.",
        errorCode: "invalid_credentials",
      }
    }

    const supabase = createClient()

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    })

    if (error) {
      let errorMessage = "An error occurred during sign in. Please try again."
      let errorCode = "unknown_error"

      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Invalid username or password. Please check your credentials and try again."
          errorCode = "invalid_credentials"
          break
        case "Email not confirmed":
          errorMessage = "Please confirm your email address before signing in."
          errorCode = "email_not_confirmed"
          break
        case "Too many requests":
          errorMessage = "Too many failed login attempts. Please try again later."
          errorCode = "too_many_requests"
          break
        default:
          errorMessage = error.message || "An unexpected error occurred. Please try again."
          errorCode = "unexpected_error"
      }

      return {
        error: errorMessage,
        errorCode,
      }
    }

    if (data.user) {
      // Set cookies for middleware
      cookies().set("user_id", data.user.id)
      cookies().set("user_role", userData.role || "customer")
      cookies().set("user_authenticated", "true")

      // Redirect based on role
      if (userData.role === "agent") {
        redirect("/dashboard/agent")
      } else {
        redirect("/dashboard/customer")
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
      errorCode: "unexpected_error",
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
  const username = formData.get("username") as string

  if (!email || !password || !username) {
    return { success: false, message: "Email, password, and username are required" }
  }

  try {
    // Check if username already exists
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return { success: false, message: "Username is already taken. Please choose a different username." }
    }

    const supabase = createClient()

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      let errorMessage = "An error occurred during registration. Please try again."

      switch (error.message) {
        case "User already registered":
          errorMessage = "This email is already in use. Please try logging in or use a different email."
          break
        case "Password should be at least 6 characters":
          errorMessage = "Password is too weak. Please use a stronger password with at least 6 characters."
          break
        case "Unable to validate email address: invalid format":
          errorMessage = "Invalid email address format."
          break
        default:
          errorMessage = error.message || "An unexpected error occurred during registration."
      }

      return { success: false, message: errorMessage }
    }

    if (data.user) {
      // Create user profile in database
      await createUser({
        id: data.user.id,
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        phone,
        country,
        role: role || "customer",
        balance: 0,
      })

      redirect("/auth/login?message=Registration successful. Please sign in.")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, message: "An unexpected error occurred during registration. Please try again." }
  }
}

export async function logoutUser() {
  const supabase = createClient()

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Clear cookies
  cookies().delete("user_id")
  cookies().delete("user_role")
  cookies().delete("user_authenticated")

  redirect("/")
}
