import { firebaseDb } from "@/lib/firebase"
import { collection, query, where, getCountFromServer } from "firebase/firestore"

// Fallback values to use when Firebase permissions are insufficient
const FALLBACK_CUSTOMER_COUNT = 500
const FALLBACK_TRANSACTION_COUNT = 1200
const FALLBACK_COUNTRIES_COUNT = 2

/**
 * Gets the count of registered customers
 * Falls back to a default value if permissions are insufficient
 */
export async function getCustomerCount(): Promise<number> {
  try {
    const customersRef = collection(firebaseDb, "users")
    const q = query(customersRef, where("role", "==", "customer"))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error: any) {
    console.error("Error getting customer count:", error)
    // Return fallback value for public display when permissions are insufficient
    return FALLBACK_CUSTOMER_COUNT
  }
}

/**
 * Gets the count of successful transactions
 * Falls back to a default value if permissions are insufficient
 */
export async function getTransactionCount(): Promise<number> {
  try {
    const transactionsRef = collection(firebaseDb, "transactions")
    const q = query(transactionsRef, where("status", "==", "completed"))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error: any) {
    console.error("Error getting transaction count:", error)
    // Return fallback value for public display when permissions are insufficient
    return FALLBACK_TRANSACTION_COUNT
  }
}

/**
 * Gets the count of countries served
 */
export async function getCountriesServed(): Promise<number> {
  try {
    // For now, we're just returning 2 since we serve Zambia and Zimbabwe
    // This could be expanded in the future to query a countries collection
    return FALLBACK_COUNTRIES_COUNT
  } catch (error: any) {
    console.error("Error getting countries count:", error)
    return FALLBACK_COUNTRIES_COUNT
  }
}
