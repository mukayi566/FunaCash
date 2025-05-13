import { firebaseDb } from "@/lib/firebase"
import { collection, query, where, getCountFromServer } from "firebase/firestore"

/**
 * Gets the count of registered customers
 */
export async function getCustomerCount(): Promise<number> {
  try {
    const customersRef = collection(firebaseDb, "users")
    const q = query(customersRef, where("role", "==", "customer"))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error: any) {
    console.error("Error getting customer count:", error)
    return 0
  }
}

/**
 * Gets the count of successful transactions
 */
export async function getTransactionCount(): Promise<number> {
  try {
    const transactionsRef = collection(firebaseDb, "transactions")
    const q = query(transactionsRef, where("status", "==", "completed"))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error: any) {
    console.error("Error getting transaction count:", error)
    return 0
  }
}

/**
 * Gets the count of countries served
 */
export async function getCountriesServed(): Promise<number> {
  try {
    // For now, we're just returning 2 since we serve Zambia and Zimbabwe
    // This could be expanded in the future to query a countries collection
    return 2
  } catch (error: any) {
    console.error("Error getting countries count:", error)
    return 0
  }
}

// REMINDER: Make sure your Firebase security rules allow read access to the 'users' and 'transactions' collections.
