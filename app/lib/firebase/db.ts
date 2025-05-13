import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"

// Re-export the db instance
export { db }

// Collection references
const usersCollection = collection(db, "users")
const transactionsCollection = collection(db, "transactions")
const exchangeRatesCollection = collection(db, "exchangeRates")
const eventsCollection = collection(db, "events")
const ticketsCollection = collection(db, "tickets")

// User functions
export const createUser = async (userId: string, userData: any) => {
  await setDoc(doc(usersCollection, userId), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const getUserById = async (userId: string) => {
  const userDoc = await getDoc(doc(usersCollection, userId))
  return userDoc.exists() ? userDoc.data() : null
}

export const updateUser = async (userId: string, userData: any) => {
  await updateDoc(doc(usersCollection, userId), {
    ...userData,
    updatedAt: serverTimestamp(),
  })
}

// Transaction functions
export const createTransaction = async (transactionData: any) => {
  return await addDoc(transactionsCollection, {
    ...transactionData,
    createdAt: serverTimestamp(),
  })
}

export const getTransactionsByUserId = async (userId: string) => {
  const q = query(transactionsCollection, where("userId", "==", userId), orderBy("createdAt", "desc"))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Exchange rate functions
export const getLatestExchangeRate = async (fromCurrency: string, toCurrency: string) => {
  const q = query(
    exchangeRatesCollection,
    where("fromCurrency", "==", fromCurrency),
    where("toCurrency", "==", toCurrency),
    orderBy("updatedAt", "desc"),
    limit(1),
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.empty ? null : querySnapshot.docs[0].data()
}

export const updateExchangeRate = async (rateId: string, rateData: any) => {
  await updateDoc(doc(exchangeRatesCollection, rateId), {
    ...rateData,
    updatedAt: serverTimestamp(),
  })
}

// Event functions
export const createEvent = async (eventData: any) => {
  return await addDoc(eventsCollection, {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const getEventById = async (eventId: string) => {
  const eventDoc = await getDoc(doc(eventsCollection, eventId))
  return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null
}

export const getAllEvents = async () => {
  const querySnapshot = await getDocs(eventsCollection)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Ticket functions
export const createTicket = async (ticketData: any) => {
  return await addDoc(ticketsCollection, {
    ...ticketData,
    createdAt: serverTimestamp(),
  })
}

export const getTicketsByEventId = async (eventId: string) => {
  const q = query(ticketsCollection, where("eventId", "==", eventId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export const getTicketsByUserId = async (userId: string) => {
  const q = query(ticketsCollection, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Get total customer count
export const getTotalCustomerCount = async () => {
  const q = query(usersCollection, where("role", "==", "customer"))
  const querySnapshot = await getDocs(q)
  return querySnapshot.size
}

// Get total countries count (based on unique user countries)
export const getTotalCountriesCount = async () => {
  const querySnapshot = await getDocs(usersCollection)
  const countries = new Set()

  querySnapshot.docs.forEach((doc) => {
    const userData = doc.data()
    if (userData.country) {
      countries.add(userData.country)
    }
  })

  return countries.size
}
