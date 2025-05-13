import { firebaseDb } from "../lib/firebase"
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore"

async function addHolyTenEvent() {
  try {
    // Create event document
    const eventRef = doc(collection(firebaseDb, "events"))

    const eventData = {
      title: "HOLY TEN - ZVAIWANA NGWARATI Album Launch",
      description:
        "GO BETWEEN EVENTS || SAMANYANGA SOUNDS PRESENTS HOLY TEN ZVAIWANA NGWARATI Album Launch. Supported by NEYO SLAYER, JAE CASH & DIZMO.",
      startDate: new Date("2025-04-15T18:00:00"),
      endDate: new Date("2025-04-15T23:00:00"),
      location: "Lusaka Showgrounds",
      city: "Lusaka",
      country: "Zambia",
      category: "Music",
      status: "active",
      featured: true,
      organizerId: "demo-organizer",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250328-133427_Instagram.jpg-TNQZ5eowmCw3pZZ6eZ6No71Pnf0dvA.jpeg",
      currency: "ZMW",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(eventRef, eventData)
    console.log("Event created with ID:", eventRef.id)

    // Create ticket types
    const regularTicketRef = doc(collection(firebaseDb, "ticketTypes"))
    const vipTicketRef = doc(collection(firebaseDb, "ticketTypes"))
    const vvipTicketRef = doc(collection(firebaseDb, "ticketTypes"))

    // Regular ticket
    await setDoc(regularTicketRef, {
      eventId: eventRef.id,
      name: "Regular",
      description: "Regular entry ticket",
      price: 100,
      currency: "ZMW",
      quantity: 1000,
      quantitySold: 0,
      maxPerPurchase: 5,
      saleStartDate: new Date("2025-03-15T00:00:00"),
      saleEndDate: new Date("2025-04-15T16:00:00"),
      status: "active",
    })

    // VIP ticket
    await setDoc(vipTicketRef, {
      eventId: eventRef.id,
      name: "VIP",
      description: "VIP access with premium seating",
      price: 200,
      currency: "ZMW",
      quantity: 200,
      quantitySold: 0,
      maxPerPurchase: 4,
      saleStartDate: new Date("2025-03-15T00:00:00"),
      saleEndDate: new Date("2025-04-15T16:00:00"),
      status: "active",
    })

    // VVIP ticket
    await setDoc(vvipTicketRef, {
      eventId: eventRef.id,
      name: "VVIP",
      description: "VVIP access with exclusive perks and meet & greet",
      price: 500,
      currency: "ZMW",
      quantity: 50,
      quantitySold: 0,
      maxPerPurchase: 2,
      saleStartDate: new Date("2025-03-15T00:00:00"),
      saleEndDate: new Date("2025-04-15T16:00:00"),
      status: "active",
    })

    console.log("Ticket types created successfully")

    // Initialize analytics for the event
    await setDoc(doc(firebaseDb, "eventAnalytics", eventRef.id), {
      eventId: eventRef.id,
      views: 0,
      ticketsSold: 0,
      revenue: 0,
      currency: "ZMW",
      lastUpdated: serverTimestamp(),
    })

    console.log("Event analytics initialized")

    return { success: true, eventId: eventRef.id }
  } catch (error) {
    console.error("Error adding Holy Ten event:", error)
    return { success: false, error: "Failed to add event" }
  }
}

// Execute the function
addHolyTenEvent().then((result) => {
  console.log("Result:", result)
})
