"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, User, Mail, Phone, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getTicketDetails } from "@/lib/ticket-service"
import type { Ticket, Event, TicketType } from "@/lib/models/event-models"

interface TicketDetailProps {
  ticketId: string
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await getTicketDetails(ticketId)

        if (result.success) {
          setTicket(result.ticket)
          setEvent(result.event)
          setTicketType(result.ticketType)
        } else {
          setError(result.error || "Failed to load ticket details")
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicketDetails()
  }, [ticketId])

  const formatDate = (date: any) => {
    if (!date) return "Date unavailable"

    try {
      const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
      return eventDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const formatTime = (date: any) => {
    if (!date) return "Time unavailable"

    try {
      const eventDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
      return eventDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Invalid time"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <Skeleton className="w-48 h-48 mb-4" />
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-4 w-48 mb-1" />
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="w-full h-24 rounded-lg" />
      </div>
    )
  }

  if (error || !ticket || !event) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "Unable to load ticket details. Please try again later."}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <Image
          src={ticket.qrCode || "/placeholder.svg?height=200&width=200&text=QR+Code"}
          alt="Ticket QR Code"
          width={200}
          height={200}
          className="rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=200&width=200&text=QR+Code"
          }}
        />
      </div>

      <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
      {ticketType && <Badge className="mb-3">{ticketType.name}</Badge>}

      <div className="space-y-1 mb-4 text-center">
        <div className="flex items-center justify-center text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(event.startDate)}</span>
        </div>
        <div className="flex items-center justify-center text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatTime(event.startDate)}</span>
        </div>
        <div className="flex items-center justify-center text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {event.location}, {event.city}
          </span>
        </div>
      </div>

      <div className="w-full p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground flex items-center">
            <User className="h-3 w-3 mr-1" /> Attendee:
          </div>
          <div>{ticket.attendeeName}</div>

          <div className="text-muted-foreground flex items-center">
            <Mail className="h-3 w-3 mr-1" /> Email:
          </div>
          <div className="truncate">{ticket.attendeeEmail}</div>

          <div className="text-muted-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1" /> Phone:
          </div>
          <div>{ticket.attendeePhone}</div>

          <div className="text-muted-foreground">Price:</div>
          <div>
            {ticket.price.toFixed(2)} {ticket.currency}
          </div>

          <div className="text-muted-foreground">Ticket ID:</div>
          <div className="font-mono text-xs truncate">{ticket.id}</div>
        </div>
      </div>

      {event.description && (
        <div className="mt-4 text-sm text-center">
          <p className="text-muted-foreground">{event.description}</p>
        </div>
      )}
    </div>
  )
}
