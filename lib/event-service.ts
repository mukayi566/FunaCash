import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp,
  increment,
  deleteDoc,
  startAfter,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { firebaseDb } from "./firebase"
import type { Event, TicketType, Ticket, EventOrganizer, EventAnalytics } from "./models/event-models"
import { generateQRCode } from "./qr-service"

// Add real-time subscription to featured events
export function subscribeToFeaturedEvents(
  callback: (events: Event[], error: string | null) => void,
  options: { limit?: number } = {},
): Unsubscribe {
  const { limit: queryLimit = 5 } = options

  const eventsQuery = query(
    collection(firebaseDb, "events"),
    where("featured", "==", true),
    where("status", "==", "active"),
    orderBy("startDate", "asc"),
    limit(queryLimit),
  )

  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      const events: Event[] = []
      snapshot.forEach((doc) => {
        const eventData = doc.data() as Event
        events.push({ ...eventData, id: doc.id })
      })
      callback(events, null)
    },
    (error) => {
      console.error("Error getting featured events:", error)
      callback([], "Failed to get featured events")
    },
  )
}

// Event CRUD operations
export async function createEvent(eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) {
  try {
    const eventRef = doc(collection(firebaseDb, "events"))

    await setDoc(eventRef, {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Initialize analytics for the event
    await setDoc(doc(firebaseDb, "eventAnalytics", eventRef.id), {
      eventId: eventRef.id,
      views: 0,
      ticketsSold: 0,
      revenue: 0,
      currency: eventData.currency || "ZMW",
      lastUpdated: serverTimestamp(),
    })

    return { success: true, eventId: eventRef.id }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, error: "Failed to create event" }
  }
}

export async function getEventById(eventId: string) {
  try {
    const eventDoc = await getDoc(doc(firebaseDb, "events", eventId))

    if (!eventDoc.exists()) {
      return { success: false, error: "Event not found" }
    }

    const eventData = eventDoc.data() as Event

    // Increment view count
    await updateDoc(doc(firebaseDb, "eventAnalytics", eventId), {
      views: increment(1),
      lastUpdated: serverTimestamp(),
    })

    return { success: true, event: { ...eventData, id: eventDoc.id } }
  } catch (error) {
    console.error("Error getting event:", error)
    return { success: false, error: "Failed to get event" }
  }
}

export async function updateEvent(eventId: string, eventData: Partial<Event>) {
  try {
    const eventRef = doc(firebaseDb, "events", eventId)

    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, error: "Failed to update event" }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    // Check if there are any sold tickets
    const ticketsQuery = query(collection(firebaseDb, "tickets"), where("eventId", "==", eventId), limit(1))

    const ticketsSnapshot = await getDocs(ticketsQuery)

    if (!ticketsSnapshot.empty) {
      return {
        success: false,
        error: "Cannot delete event with sold tickets. Please cancel the event instead.",
      }
    }

    // Delete ticket types
    const ticketTypesQuery = query(collection(firebaseDb, "ticketTypes"), where("eventId", "==", eventId))

    const ticketTypesSnapshot = await getDocs(ticketTypesQuery)

    const deleteTicketTypesPromises = ticketTypesSnapshot.docs.map((doc) => deleteDoc(doc.ref))

    await Promise.all(deleteTicketTypesPromises)

    // Delete event analytics
    await deleteDoc(doc(firebaseDb, "eventAnalytics", eventId))

    // Delete the event
    await deleteDoc(doc(firebaseDb, "events", eventId))

    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, error: "Failed to delete event" }
  }
}

// Modify the getEvents function to avoid requiring a composite index
export async function getEvents(options: {
  limit?: number
  category?: string
  city?: string
  featured?: boolean
  organizerId?: string
  status?: string
  startAfter?: any
}) {
  try {
    const { limit: queryLimit = 10, category, city, featured, organizerId, status, startAfter: cursor } = options

    // Start with a basic query with just ordering by startDate
    let eventsQuery = query(collection(firebaseDb, "events"), orderBy("startDate", "asc"))

    // Apply filters one by one to avoid complex composite index requirements
    // Note: This approach may still require simple indexes but not complex composite ones

    // Apply status filter if provided (most common filter)
    if (status) {
      // We'll fetch all events with this status and filter the rest in memory
      eventsQuery = query(collection(firebaseDb, "events"), where("status", "==", status), orderBy("startDate", "asc"))
    }

    // Apply cursor pagination if provided
    if (cursor) {
      eventsQuery = query(eventsQuery, startAfter(cursor))
    }

    // Execute the query
    const eventsSnapshot = await getDocs(eventsQuery)
    const events: Event[] = []

    // Apply remaining filters in memory
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data() as Event
      const event = { ...eventData, id: doc.id }

      // Apply additional filters in memory
      let includeEvent = true

      if (category && event.category !== category) includeEvent = false
      if (city && event.city !== city) includeEvent = false
      if (featured !== undefined && event.featured !== featured) includeEvent = false
      if (organizerId && event.organizerId !== organizerId) includeEvent = false

      if (includeEvent) {
        events.push(event)
      }
    })

    // Apply limit after in-memory filtering
    const limitedEvents = events.slice(0, queryLimit)
    const lastDoc = eventsSnapshot.docs[eventsSnapshot.docs.length - 1]

    return {
      success: true,
      events: limitedEvents,
      lastDoc,
      hasMore: events.length > queryLimit,
    }
  } catch (error) {
    console.error("Error getting events:", error)
    return { success: false, error: "Failed to get events" }
  }
}

// Ticket Type CRUD operations
export async function createTicketType(ticketTypeData: Omit<TicketType, "id">) {
  try {
    const ticketTypeRef = doc(collection(firebaseDb, "ticketTypes"))

    await setDoc(ticketTypeRef, ticketTypeData)

    return { success: true, ticketTypeId: ticketTypeRef.id }
  } catch (error) {
    console.error("Error creating ticket type:", error)
    return { success: false, error: "Failed to create ticket type" }
  }
}

export async function getTicketTypesByEventId(eventId: string) {
  try {
    const ticketTypesQuery = query(
      collection(firebaseDb, "ticketTypes"),
      where("eventId", "==", eventId),
      where("status", "==", "active"),
    )

    const ticketTypesSnapshot = await getDocs(ticketTypesQuery)
    const ticketTypes: TicketType[] = []

    ticketTypesSnapshot.forEach((doc) => {
      const ticketTypeData = doc.data() as TicketType
      ticketTypes.push({ ...ticketTypeData, id: doc.id })
    })

    return { success: true, ticketTypes }
  } catch (error) {
    console.error("Error getting ticket types:", error)
    return { success: false, error: "Failed to get ticket types" }
  }
}

export async function updateTicketType(ticketTypeId: string, ticketTypeData: Partial<TicketType>) {
  try {
    const ticketTypeRef = doc(firebaseDb, "ticketTypes", ticketTypeId)

    await updateDoc(ticketTypeRef, ticketTypeData)

    return { success: true }
  } catch (error) {
    console.error("Error updating ticket type:", error)
    return { success: false, error: "Failed to update ticket type" }
  }
}

// Ticket purchase and management
export async function purchaseTicket(ticketData: {
  ticketTypeId: string
  eventId: string
  userId: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone: string
  quantity: number
  transactionId: string
}) {
  try {
    const { ticketTypeId, eventId, userId, attendeeName, attendeeEmail, attendeePhone, quantity, transactionId } =
      ticketData

    // Get ticket type
    const ticketTypeDoc = await getDoc(doc(firebaseDb, "ticketTypes", ticketTypeId))

    if (!ticketTypeDoc.exists()) {
      return { success: false, error: "Ticket type not found" }
    }

    const ticketType = ticketTypeDoc.data() as TicketType

    // Check if tickets are available
    if (ticketType.quantitySold + quantity > ticketType.quantity) {
      return { success: false, error: "Not enough tickets available" }
    }

    // Check if sale is active
    const now = new Date()
    const saleStartDate =
      ticketType.saleStartDate instanceof Timestamp
        ? ticketType.saleStartDate.toDate()
        : new Date(ticketType.saleStartDate)

    const saleEndDate =
      ticketType.saleEndDate instanceof Timestamp ? ticketType.saleEndDate.toDate() : new Date(ticketType.saleEndDate)

    if (now < saleStartDate || now > saleEndDate) {
      return { success: false, error: "Ticket sales are not active" }
    }

    // Create tickets
    const tickets: Ticket[] = []
    const ticketIds: string[] = []

    for (let i = 0; i < quantity; i++) {
      const ticketRef = doc(collection(firebaseDb, "tickets"))
      const qrCode = await generateQRCode(ticketRef.id)

      const ticketData: Ticket = {
        ticketTypeId,
        eventId,
        userId,
        purchaseDate: serverTimestamp(),
        status: "valid",
        qrCode,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        price: ticketType.price,
        currency: ticketType.currency,
        transactionId,
      }

      await setDoc(ticketRef, ticketData)

      tickets.push({ ...ticketData, id: ticketRef.id })
      ticketIds.push(ticketRef.id)
    }

    // Update ticket type quantity sold
    await updateDoc(doc(firebaseDb, "ticketTypes", ticketTypeId), {
      quantitySold: increment(quantity),
    })

    // Update event analytics
    await updateDoc(doc(firebaseDb, "eventAnalytics", eventId), {
      ticketsSold: increment(quantity),
      revenue: increment(ticketType.price * quantity),
      lastUpdated: serverTimestamp(),
    })

    return {
      success: true,
      tickets,
      ticketIds,
    }
  } catch (error) {
    console.error("Error purchasing ticket:", error)
    return { success: false, error: "Failed to purchase ticket" }
  }
}

export async function getUserTickets(userId: string) {
  try {
    const ticketsQuery = query(
      collection(firebaseDb, "tickets"),
      where("userId", "==", userId),
      orderBy("purchaseDate", "desc"),
    )

    const ticketsSnapshot = await getDocs(ticketsQuery)
    const tickets: Ticket[] = []

    ticketsSnapshot.forEach((doc) => {
      const ticketData = doc.data() as Ticket
      tickets.push({ ...ticketData, id: doc.id })
    })

    // Get event details for each ticket
    const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))]
    const events: Record<string, Event> = {}

    for (const eventId of eventIds) {
      const eventDoc = await getDoc(doc(firebaseDb, "events", eventId))

      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as Event
        events[eventId] = { ...eventData, id: eventId }
      }
    }

    return {
      success: true,
      tickets,
      events,
    }
  } catch (error) {
    console.error("Error getting user tickets:", error)
    return { success: false, error: "Failed to get user tickets" }
  }
}

export async function verifyTicket(ticketId: string) {
  try {
    const ticketDoc = await getDoc(doc(firebaseDb, "tickets", ticketId))

    if (!ticketDoc.exists()) {
      return { success: false, error: "Ticket not found" }
    }

    const ticketData = ticketDoc.data() as Ticket

    if (ticketData.status !== "valid") {
      return {
        success: false,
        error: `Ticket is ${ticketData.status}`,
        ticket: { ...ticketData, id: ticketId },
      }
    }

    // Mark ticket as used
    await updateDoc(doc(firebaseDb, "tickets", ticketId), {
      status: "used",
    })

    return {
      success: true,
      ticket: { ...ticketData, id: ticketId, status: "used" },
    }
  } catch (error) {
    console.error("Error verifying ticket:", error)
    return { success: false, error: "Failed to verify ticket" }
  }
}

// Event Organizer operations
export async function createEventOrganizer(organizerData: Omit<EventOrganizer, "id" | "createdAt" | "verified">) {
  try {
    const organizerRef = doc(collection(firebaseDb, "eventOrganizers"))

    await setDoc(organizerRef, {
      ...organizerData,
      verified: false,
      createdAt: serverTimestamp(),
    })

    return { success: true, organizerId: organizerRef.id }
  } catch (error) {
    console.error("Error creating event organizer:", error)
    return { success: false, error: "Failed to create event organizer" }
  }
}

export async function getEventOrganizerByUserId(userId: string) {
  try {
    const organizersQuery = query(collection(firebaseDb, "eventOrganizers"), where("userId", "==", userId), limit(1))

    const organizersSnapshot = await getDocs(organizersQuery)

    if (organizersSnapshot.empty) {
      return { success: false, error: "Event organizer not found" }
    }

    const organizerDoc = organizersSnapshot.docs[0]
    const organizerData = organizerDoc.data() as EventOrganizer

    return {
      success: true,
      organizer: { ...organizerData, id: organizerDoc.id },
    }
  } catch (error) {
    console.error("Error getting event organizer:", error)
    return { success: false, error: "Failed to get event organizer" }
  }
}

export async function getEventAnalytics(eventId: string) {
  try {
    const analyticsDoc = await getDoc(doc(firebaseDb, "eventAnalytics", eventId))

    if (!analyticsDoc.exists()) {
      return { success: false, error: "Event analytics not found" }
    }

    const analyticsData = analyticsDoc.data() as EventAnalytics

    return { success: true, analytics: analyticsData }
  } catch (error) {
    console.error("Error getting event analytics:", error)
    return { success: false, error: "Failed to get event analytics" }
  }
}
