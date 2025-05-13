"use server"

import {
  generateReferralCode,
  applyReferralCode,
  getReferralStats,
  getUserReferrals,
  validateReferralCode,
} from "@/lib/referral-service"
import { cookies } from "next/headers"

// Generate a referral code for the current user
export async function generateUserReferralCode() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return { success: false, error: "User not authenticated" }
    }

    return await generateReferralCode(userId)
  } catch (error) {
    console.error("Error generating user referral code:", error)
    return { success: false, error: "Failed to generate referral code" }
  }
}

// Apply a referral code during signup
export async function applyUserReferralCode(formData: FormData) {
  try {
    const code = formData.get("referralCode") as string
    const userId = cookies().get("user_id")?.value

    if (!code) {
      return { success: false, error: "Referral code is required" }
    }

    if (!userId) {
      return { success: false, error: "User not authenticated" }
    }

    return await applyReferralCode(code, userId)
  } catch (error) {
    console.error("Error applying referral code:", error)
    return { success: false, error: "Failed to apply referral code" }
  }
}

// Get referral statistics for the current user
export async function getUserReferralStats() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return { success: false, error: "User not authenticated" }
    }

    return await getReferralStats(userId)
  } catch (error) {
    console.error("Error getting user referral stats:", error)
    return { success: false, error: "Failed to get referral statistics" }
  }
}

// Get referrals for the current user
export async function getCurrentUserReferrals() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return { success: false, error: "User not authenticated" }
    }

    return await getUserReferrals(userId)
  } catch (error) {
    console.error("Error getting user referrals:", error)
    return { success: false, error: "Failed to get referrals" }
  }
}

// Validate a referral code
export async function validateUserReferralCode(code: string) {
  try {
    if (!code) {
      return { success: false, valid: false, error: "Referral code is required" }
    }

    return await validateReferralCode(code)
  } catch (error) {
    console.error("Error validating referral code:", error)
    return { success: false, valid: false, error: "Failed to validate referral code" }
  }
}
