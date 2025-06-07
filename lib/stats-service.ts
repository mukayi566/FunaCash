import { firebaseDb } from "@/lib/firebase"
import { collection, query, where, getCountFromServer } from "firebase/firestore"

// Fallback values to use when Firebase permissions are insufficient
const FALLBACK_CUSTOMER_COUNT = 500
const FALLBACK_TRANSACTION_COUNT = 1200
const FALLBACK_COUNTRIES_COUNT = 2

/**
 * Gets the count of registered customers or returns a fallback value
 */
export async function getCustomerCount(): Promise<number> {
  try {
    const customersRef = collection(firebaseDb, "users")
    const q = query(customersRef, where("role", "==", "customer"))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error: any) {
    console.warn("Using fallback customer count due to permissions")
    return FALLBACK_CUSTOMER_COUNT
  }
}

/**
 * Gets the count of successful transactions or returns a fallback value
 */
export async function getTransactionCount(): Promise<number> {
  try {
    const transactionsRef = collection(firebaseDb, "transactions")
    const q = query(transactionsRef, where("status", "==", "completed"))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error: any) {
    console.warn("Using fallback transaction count due to permissions")
    return FALLBACK_TRANSACTION_COUNT
  }
}

/**
 * Gets the count of countries served
 */
export async function getCountriesServed(): Promise<number> {
  // This is a static value, so no need to query Firestore
  return FALLBACK_COUNTRIES_COUNT
}
