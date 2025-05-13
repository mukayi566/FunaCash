import { collection, doc, setDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp } from "firebase/firestore"
import { firebaseDb } from "./firebase"
import type { ReferralCode, Referral, ReferralStats } from "./models/referral-models"
import { getUserById, updateUserBalance } from "./db-service"

// Generate a unique referral code
export async function generateReferralCode(
  userId: string,
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    // Check if user already has an active referral code
    const existingCodesQuery = query(
      collection(firebaseDb, "referralCodes"),
      where("userId", "==", userId),
      where("active", "==", true),
    )

    const existingCodesSnapshot = await getDocs(existingCodesQuery)

    if (!existingCodesSnapshot.empty) {
      // Return the existing code
      const existingCode = existingCodesSnapshot.docs[0].data() as ReferralCode
      return { success: true, code: existingCode.code }
    }

    // Get user document to retrieve username
    const userResult = await getUserById(userId)
    if (!userResult.success || !userResult.user) {
      return { success: false, error: "User not found" }
    }

    const username = userResult.user.username

    // Check if username already exists
    const codeQuery = query(collection(firebaseDb, "referralCodes"), where("code", "==", username))

    const codeSnapshot = await getDocs(codeQuery)

    if (!codeSnapshot.empty) {
      // Username already exists as a referral code, handle this edge case
      // For now, return an error. A more sophisticated approach might involve appending a suffix.
      return { success: false, error: "Username already exists as a referral code." }
    }

    // Save the username as the referral code
    const codeRef = doc(collection(firebaseDb, "referralCodes"))
    await setDoc(codeRef, {
      userId,
      code: username,
      active: true,
      createdAt: serverTimestamp(),
    })

    return { success: true, code: username }
  } catch (error) {
    console.error("Error generating referral code:", error)
    return { success: false, error: "Failed to generate referral code" }
  }
}

// Apply a referral code during signup
export async function applyReferralCode(
  code: string,
  newUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the referral code
    const codeQuery = query(
      collection(firebaseDb, "referralCodes"),
      where("code", "==", code),
      where("active", "==", true),
    )

    const codeSnapshot = await getDocs(codeQuery)

    if (codeSnapshot.empty) {
      return { success: false, error: "Invalid or expired referral code" }
    }

    const referralCode = codeSnapshot.docs[0].data() as ReferralCode
    const referrerId = referralCode.userId

    // Make sure user isn't referring themselves
    if (referrerId === newUserId) {
      return { success: false, error: "You cannot refer yourself" }
    }

    // Get referrer's country to validate eligibility
    const referrerResult = await getUserById(referrerId)
    if (!referrerResult.success) {
      return { success: false, error: "Referrer not found" }
    }

    const referrer = referrerResult.user
    if (referrer.country.toLowerCase() !== "zambia") {
      return { success: false, error: "Only users from Zambia can refer others" }
    }

    // Get new user's country
    const newUserResult = await getUserById(newUserId)
    if (!newUserResult.success) {
      return { success: false, error: "User not found" }
    }

    const newUser = newUserResult.user
    const newUserCountry = newUser.country.toLowerCase()

    // Check if new user is from Zambia or Zimbabwe
    if (newUserCountry !== "zambia" && newUserCountry !== "zimbabwe") {
      return { success: false, error: "Referral program is only available for users in Zambia and Zimbabwe" }
    }

    // Count existing successful referrals to determine reward amount
    const referralsQuery = query(
      collection(firebaseDb, "referrals"),
      where("referrerId", "==", referrerId),
      where("status", "==", "completed"),
    )

    const referralsSnapshot = await getDocs(referralsQuery)
    const successfulReferrals = referralsSnapshot.size

    // Determine reward amount based on tier
    const rewardAmount = successfulReferrals < 10 ? 5 : 2.5

    // Create the referral record
    const referralRef = doc(collection(firebaseDb, "referrals"))
    await setDoc(referralRef, {
      referrerId,
      referredId: newUserId,
      referralCode: code,
      status: "pending",
      transactionCompleted: false,
      rewardAmount,
      rewardPaid: false,
      createdAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error applying referral code:", error)
    return { success: false, error: "Failed to apply referral code" }
  }
}

// Complete a referral after first transaction
export async function completeReferral(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find pending referral for this user
    const referralQuery = query(
      collection(firebaseDb, "referrals"),
      where("referredId", "==", userId),
      where("status", "==", "pending"),
    )

    const referralSnapshot = await getDocs(referralQuery)

    if (referralSnapshot.empty) {
      return { success: true } // No pending referral, just return success
    }

    const referralDoc = referralSnapshot.docs[0]
    const referral = referralDoc.data() as Referral

    // Update referral status
    await updateDoc(doc(firebaseDb, "referrals", referralDoc.id), {
      status: "completed",
      transactionCompleted: true,
      completedAt: serverTimestamp(),
    })

    // Pay the reward to the referrer
    await updateUserBalance(referral.referrerId, referral.rewardAmount)

    // Mark reward as paid
    await updateDoc(doc(firebaseDb, "referrals", referralDoc.id), {
      rewardPaid: true,
    })

    return { success: true }
  } catch (error) {
    console.error("Error completing referral:", error)
    return { success: false, error: "Failed to complete referral" }
  }
}

// Get referral statistics for a user
export async function getReferralStats(
  userId: string,
): Promise<{ success: boolean; stats?: ReferralStats; error?: string }> {
  try {
    // Get all referrals for this user
    const referralsQuery = query(collection(firebaseDb, "referrals"), where("referrerId", "==", userId))

    const referralsSnapshot = await getDocs(referralsQuery)

    if (referralsSnapshot.empty) {
      return {
        success: true,
        stats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingReferrals: 0,
          totalRewardsEarned: 0,
          rewardsPaid: 0,
          rewardsPending: 0,
        },
      }
    }

    let totalReferrals = 0
    let successfulReferrals = 0
    let pendingReferrals = 0
    let totalRewardsEarned = 0
    let rewardsPaid = 0
    let rewardsPending = 0

    referralsSnapshot.forEach((doc) => {
      const referral = doc.data() as Referral
      totalReferrals++

      if (referral.status === "completed") {
        successfulReferrals++
        totalRewardsEarned += referral.rewardAmount

        if (referral.rewardPaid) {
          rewardsPaid += referral.rewardAmount
        } else {
          rewardsPending += referral.rewardAmount
        }
      } else {
        pendingReferrals++
      }
    })

    return {
      success: true,
      stats: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        totalRewardsEarned,
        rewardsPaid,
        rewardsPending,
      },
    }
  } catch (error) {
    console.error("Error getting referral stats:", error)
    return { success: false, error: "Failed to get referral statistics" }
  }
}

// Get referrals for a user
export async function getUserReferrals(
  userId: string,
): Promise<{ success: boolean; referrals?: Referral[]; error?: string }> {
  try {
    const referralsQuery = query(
      collection(firebaseDb, "referrals"),
      where("referrerId", "==", userId),
      orderBy("createdAt", "desc"),
    )

    const referralsSnapshot = await getDocs(referralsQuery)

    const referrals: Referral[] = []

    referralsSnapshot.forEach((doc) => {
      const referral = doc.data() as Referral
      referrals.push({
        ...referral,
        id: doc.id,
      })
    })

    return { success: true, referrals }
  } catch (error) {
    console.error("Error getting user referrals:", error)
    return { success: false, error: "Failed to get referrals" }
  }
}

// Validate a referral code
export async function validateReferralCode(
  code: string,
): Promise<{ success: boolean; valid: boolean; error?: string }> {
  try {
    const codeQuery = query(
      collection(firebaseDb, "referralCodes"),
      where("code", "==", code),
      where("active", "==", true),
    )

    const codeSnapshot = await getDocs(codeQuery)

    return { success: true, valid: !codeSnapshot.empty }
  } catch (error) {
    console.error("Error validating referral code:", error)
    return { success: false, valid: false, error: "Failed to validate referral code" }
  }
}
