import { supabase } from "./config"
import type { Database } from "./types"

type User = Database["public"]["Tables"]["users"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
type UserUpdate = Database["public"]["Tables"]["users"]["Update"]
type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"]

// User functions
export const createUser = async (userData: UserInsert) => {
  const { data, error } = await supabase.from("users").insert(userData).select().single()

  if (error) throw error
  return data
}

export const getUserById = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export const updateUser = async (userId: string, userData: UserUpdate) => {
  const { data, error } = await supabase
    .from("users")
    .update({ ...userData, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Transaction functions
export const createTransaction = async (transactionData: TransactionInsert) => {
  const { data, error } = await supabase.from("transactions").insert(transactionData).select().single()

  if (error) throw error
  return data
}

export const getTransactionsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Exchange rate functions
export const getLatestExchangeRate = async (fromCurrency: string, toCurrency: string) => {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .eq("from_currency", fromCurrency)
    .eq("to_currency", toCurrency)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export const updateExchangeRate = async (rateId: string, rateData: any) => {
  const { data, error } = await supabase
    .from("exchange_rates")
    .update({ ...rateData, updated_at: new Date().toISOString() })
    .eq("id", rateId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Event functions
export const createEvent = async (eventData: any) => {
  const { data, error } = await supabase.from("events").insert(eventData).select().single()

  if (error) throw error
  return data
}

export const getEventById = async (eventId: string) => {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export const getAllEvents = async () => {
  const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true })

  if (error) throw error
  return data || []
}

// Ticket functions
export const createTicket = async (ticketData: any) => {
  const { data, error } = await supabase.from("tickets").insert(ticketData).select().single()

  if (error) throw error
  return data
}

export const getTicketsByEventId = async (eventId: string) => {
  const { data, error } = await supabase.from("tickets").select("*").eq("event_id", eventId)

  if (error) throw error
  return data || []
}

export const getTicketsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      events (
        title,
        date,
        location
      )
    `)
    .eq("user_id", userId)

  if (error) throw error
  return data || []
}

// Statistics functions
export const getTotalCustomerCount = async () => {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")

  if (error) throw error
  return count || 0
}

export const getTotalCountriesCount = async () => {
  const { data, error } = await supabase.from("users").select("country").not("country", "is", null)

  if (error) throw error

  const uniqueCountries = new Set(data?.map((user) => user.country))
  return uniqueCountries.size
}
