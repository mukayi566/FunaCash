import type { Timestamp } from "firebase/firestore"

export interface Event {
  id?: string
  title: string
  description: string
  location: string
  city: string
  startDate: Timestamp | Date
  endDate?: Timestamp | Date
  imageUrl?: string
  organizerId: string
  organizerName: string
  category: string
  status: "draft" | "published" | "cancelled" | "completed"
  featured: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface TicketType {
  id?: string
  eventId: string
  name: string
  description?: string
  price: number
  currency: string
  quantity: number
  quantitySold: number
  maxPerPurchase: number
  saleStartDate: Timestamp | Date
  saleEndDate: Timestamp | Date
  status: "active" | "soldout" | "inactive"
}

export interface Ticket {
  id?: string
  ticketTypeId: string
  eventId: string
  userId: string
  purchaseDate: Timestamp | Date
  status: "valid" | "used" | "cancelled" | "refunded"
  qrCode: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone: string
  price: number
  currency: string
  transactionId: string
}

export interface EventOrganizer {
  id?: string
  userId: string
  organizationName: string
  description?: string
  website?: string
  email: string
  phone: string
  logoUrl?: string
  verified: boolean
  createdAt?: Timestamp
}

export interface EventAnalytics {
  eventId: string
  views: number
  ticketsSold: number
  revenue: number
  currency: string
  lastUpdated: Timestamp
}
