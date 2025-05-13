import { doc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore"
import { firebaseDb } from "./firebase"

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const userDoc = await getDoc(doc(firebaseDb, "users", userId))

    if (!userDoc.exists()) {
      return { success: false, error: "User not found" }
    }

    const userData = userDoc.data()

    return {
      success: true,
      user: { ...userData, id: userDoc.id },
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return { success: false, error: "Failed to get user" }
  }
}

// Update user balance
export async function updateUserBalance(userId: string, amount: number) {
  try {
    const userRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return { success: false, error: "User not found" }
    }

    const userData = userDoc.data()

    // Update the balance
    await updateDoc(userRef, {
      balance: (userData.balance || 0) + amount,
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user balance:", error)
    return { success: false, error: "Failed to update user balance" }
  }
}

// Update user profile picture
export async function updateUserProfilePicture(userId: string, profilePictureUrl: string | null) {
  try {
    const userRef = doc(firebaseDb, "users", userId)

    await updateDoc(userRef, {
      profilePicture: profilePictureUrl,
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating profile picture:", error)
    return { success: false, error: "Failed to update profile picture" }
  }
}

// Create a new transaction
export async function createTransaction(db: any, transactionData: any) {
  try {
    const transactionsCollection = collection(db, "transactions")
    const docRef = await addDoc(transactionsCollection, transactionData)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { success: false, error: "Failed to create transaction" }
  }
}
