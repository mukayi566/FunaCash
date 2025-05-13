import { collection, doc, getDoc, query, where, onSnapshot, orderBy, type Unsubscribe } from "firebase/firestore"
import { firebaseDb } from "./firebase"
import type { Ticket, Event, TicketType } from "./models/event-models"

// Get a single ticket by ID with real-time updates
export function subscribeToTicket(
  ticketId: string,
  callback: (ticket: Ticket | null, error: string | null) => void,
): Unsubscribe {
  const ticketRef = doc(firebaseDb, "tickets", ticketId)

  return onSnapshot(
    ticketRef,
    (doc) => {
      if (doc.exists()) {
        const ticketData = doc.data() as Ticket
        callback({ ...ticketData, id: doc.id }, null)
      } else {
        callback(null, "Ticket not found")
      }
    },
    (error) => {
      console.error("Error getting ticket:", error)
      callback(null, "Failed to get ticket data")
    },
  )
}

// Get event details for a ticket with real-time updates
export function subscribeToEvent(
  eventId: string,
  callback: (event: Event | null, error: string | null) => void,
): Unsubscribe {
  const eventRef = doc(firebaseDb, "events", eventId)

  return onSnapshot(
    eventRef,
    (doc) => {
      if (doc.exists()) {
        const eventData = doc.data() as Event
        callback({ ...eventData, id: doc.id }, null)
      } else {
        callback(null, "Event not found")
      }
    },
    (error) => {
      console.error("Error getting event:", error)
      callback(null, "Failed to get event data")
    },
  )
}

// Get ticket type details with real-time updates
export function subscribeToTicketType(
  ticketTypeId: string,
  callback: (ticketType: TicketType | null, error: string | null) => void,
): Unsubscribe {
  const ticketTypeRef = doc(firebaseDb, "ticketTypes", ticketTypeId)

  return onSnapshot(
    ticketTypeRef,
    (doc) => {
      if (doc.exists()) {
        const ticketTypeData = doc.data() as TicketType
        callback({ ...ticketTypeData, id: doc.id }, null)
      } else {
        callback(null, "Ticket type not found")
      }
    },
    (error) => {
      console.error("Error getting ticket type:", error)
      callback(null, "Failed to get ticket type data")
    },
  )
}

// Subscribe to all user tickets with real-time updates
export function subscribeToUserTickets(
  userId: string,
  callback: (tickets: Ticket[], events: Record<string, Event>, error: string | null) => void,
): Unsubscribe {
  const ticketsQuery = query(
    collection(firebaseDb, "tickets"),
    where("userId", "==", userId),
    orderBy("purchaseDate", "desc"),
  )

  return onSnapshot(
    ticketsQuery,
    async (snapshot) => {
      try {
        const tickets: Ticket[] = []
        snapshot.forEach((doc) => {
          const ticketData = doc.data() as Ticket
          tickets.push({ ...ticketData, id: doc.id })
        })

        // Get event details for each ticket
        const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))]
        const events: Record<string, Event> = {}

        const eventPromises = eventIds.map(async (eventId) => {
          try {
            const eventDoc = await getDoc(doc(firebaseDb, "events", eventId))
            if (eventDoc.exists()) {
              const eventData = eventDoc.data() as Event
              events[eventId] = { ...eventData, id: eventId }
            }
          } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error)
          }
        })

        await Promise.all(eventPromises)
        callback(tickets, events, null)
      } catch (error) {
        console.error("Error processing tickets:", error)
        callback([], {}, "Failed to process ticket data")
      }
    },
    (error) => {
      console.error("Error getting user tickets:", error)
      callback([], {}, "Failed to get tickets")
    },
  )
}

// Fetch ticket details with associated event and ticket type
export async function getTicketDetails(ticketId: string) {
  try {
    const ticketDoc = await getDoc(doc(firebaseDb, "tickets", ticketId))

    if (!ticketDoc.exists()) {
      return { success: false, error: "Ticket not found" }
    }

    const ticketData = ticketDoc.data() as Ticket
    const ticket = { ...ticketData, id: ticketDoc.id }

    // Get event details
    const eventDoc = await getDoc(doc(firebaseDb, "events", ticket.eventId))

    if (!eventDoc.exists()) {
      return {
        success: false,
        error: "Event not found",
        ticket,
      }
    }

    const eventData = eventDoc.data() as Event
    const event = { ...eventData, id: eventDoc.id }

    // Get ticket type details
    const ticketTypeDoc = await getDoc(doc(firebaseDb, "ticketTypes", ticket.ticketTypeId))

    let ticketType = null
    if (ticketTypeDoc.exists()) {
      const ticketTypeData = ticketTypeDoc.data() as TicketType
      ticketType = { ...ticketTypeData, id: ticketTypeDoc.id }
    }

    return {
      success: true,
      ticket,
      event,
      ticketType,
    }
  } catch (error) {
    console.error("Error getting ticket details:", error)
    return { success: false, error: "Failed to get ticket details" }
  }
}
